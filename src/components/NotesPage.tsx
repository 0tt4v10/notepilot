import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  BookOpen, Plus, Trash2, Bold, Italic, Underline, Strikethrough,
  List, ListOrdered, Type, ChevronRight, FileText, Upload,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Undo2, Redo2, Highlighter, Save, Check, Pencil, GripVertical, HelpCircle, X, Sparkles, Loader2,
} from 'lucide-react';
import { chat } from '../services/aiService';
import { loadNotebooksFromCloud, saveNotebooksToCloud } from '../lib/supabase';
import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
import { useLanguage } from '../LanguageContext';

interface Page {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
}

interface Section {
  id: string;
  name: string;
  color: string;
  pages: Page[];
}

interface Notebook {
  id: string;
  name: string;
  sections: Section[];
}

type DragItem =
  | { type: 'page'; pageId: string; fromNbId: string; fromSecId: string }
  | { type: 'section'; secId: string; fromNbId: string };

const COLORS = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500', 'bg-pink-500'];

const DEFAULT_NOTEBOOKS: Notebook[] = [
  {
    id: '1',
    name: 'Mein Notizbuch',
    sections: [
      {
        id: 's1', name: 'Allgemein', color: 'bg-blue-500',
        pages: [
          { id: 'p1', title: 'Neue Seite', updatedAt: new Date().toISOString().slice(0, 10), content: '' },
        ],
      },
    ],
  },
];

function storageKey(username: string) { return `notepilot-notebooks-${username}`; }

function loadNotebooks(username: string): Notebook[] {
  try {
    const raw = localStorage.getItem(storageKey(username));
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch { /* ignore */ }
  return DEFAULT_NOTEBOOKS;
}

function now() { return new Date().toISOString().slice(0, 10); }

function countReplacementChars(s: string): number {
  let n = 0;
  for (let i = 0; i < s.length; i++) if (s.charCodeAt(i) === 0xFFFD) n++;
  return n;
}

function decodeFile(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  if (bytes[0] === 0xFF && bytes[1] === 0xFE) return new TextDecoder('utf-16le').decode(buffer.slice(2));
  if (bytes[0] === 0xFE && bytes[1] === 0xFF) return new TextDecoder('utf-16be').decode(buffer.slice(2));
  if (bytes[0] === 0xEF && bytes[1] === 0xBB && bytes[2] === 0xBF) return new TextDecoder('utf-8').decode(buffer.slice(3));
  const nullsAtOdd = [1, 3, 5, 7, 9, 11, 13, 15].filter(i => bytes[i] === 0x00).length;
  if (nullsAtOdd >= 6) return new TextDecoder('utf-16le').decode(buffer);
  const asUtf8 = new TextDecoder('utf-8').decode(buffer);
  const asW1252 = new TextDecoder('windows-1252').decode(buffer);
  return countReplacementChars(asUtf8) <= countReplacementChars(asW1252) ? asUtf8 : asW1252;
}

function parseOneNoteHtml(html: string): { title: string; content: string } {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  doc.querySelectorAll('script, style, link').forEach(el => el.remove());
  const title = doc.title || doc.querySelector('h1')?.textContent || 'Importierte Notiz';
  return { title: title.trim(), content: doc.body?.innerHTML ?? html };
}

export default function NotesPage({ username }: { username: string }) {
  const { t } = useLanguage();
  const [notebooks, setNotebooks] = useState<Notebook[]>(() => loadNotebooks(username));
  const [selNb, setSelNb] = useState<Notebook>(notebooks[0]);
  const [selSec, setSelSec] = useState<Section>(notebooks[0].sections[0]);
  const [selPage, setSelPage] = useState<Page>(notebooks[0].sections[0].pages[0]);
  const [pageTitle, setPageTitle] = useState(selPage.title);
  const [importError, setImportError] = useState('');
  const [showImportHelp, setShowImportHelp] = useState(false);
  const [colorPickerOpen, setColorPickerOpen] = useState<'text' | 'highlight' | null>(null);
  const [saved, setSaved] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  // Rename state
  const [renamingPageId, setRenamingPageId] = useState<string | null>(null);
  const [renamingSecId, setRenamingSecId] = useState<string | null>(null);
  const [renamingNbId, setRenamingNbId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  // Drag state
  const dragItem = useRef<DragItem | null>(null);
  const [dragOverPageId, setDragOverPageId] = useState<string | null>(null);
  const [dragOverSecId, setDragOverSecId] = useState<string | null>(null);

  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Prevent saving stale localStorage data to cloud before cloud load completes
  const cloudLoadDone = useRef(false);

  useEffect(() => {
    if (editorRef.current) editorRef.current.innerHTML = selPage.content;
  }, [selPage.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    localStorage.setItem(storageKey(username), JSON.stringify(notebooks));
    if (cloudLoadDone.current) saveNotebooksToCloud(username, notebooks);
  }, [notebooks, username]);

  // Load from cloud on mount — cloud always wins over local cache
  useEffect(() => {
    loadNotebooksFromCloud(username).then(cloudData => {
      cloudLoadDone.current = true;
      if (!cloudData || cloudData.length === 0) return;
      setNotebooks(cloudData);
      const nb = cloudData[0];
      const sec = nb.sections[0];
      const pg = sec.pages[0];
      setSelNb(nb); setSelSec(sec); setSelPage(pg); setPageTitle(pg.title);
      if (editorRef.current) editorRef.current.innerHTML = pg.content;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  const syncPage = useCallback((updates: Partial<Page>) => {
    setNotebooks(prev => prev.map(nb =>
      nb.id !== selNb.id ? nb : {
        ...nb,
        sections: nb.sections.map(sec =>
          sec.id !== selSec.id ? sec : {
            ...sec,
            pages: sec.pages.map(pg =>
              pg.id !== selPage.id ? pg : { ...pg, ...updates, updatedAt: now() }
            ),
          }
        ),
      }
    ));
  }, [selNb.id, selSec.id, selPage.id]);

  const handleTitleBlur = () => { syncPage({ title: pageTitle }); setSelPage(p => ({ ...p, title: pageTitle })); };
  const handleSave = () => {
    syncPage({ title: pageTitle, content: editorRef.current?.innerHTML ?? '' });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };
  const handleAiStructure = async () => {
    const raw = editorRef.current?.innerHTML ?? '';
    const text = raw.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (!text) return;
    setAiLoading(true);
    try {
      const result = await chat([{
        role: 'user',
        content: `Strukturiere diesen Text als saubere HTML-Notiz mit Überschriften (<h2>, <h3>), Aufzählungen (<ul><li>) und fetten Schlüsselbegriffen (<b>). Gib NUR den HTML-Inhalt zurück, kein Markdown, keine Erklärungen:\n\n${text}`
      }]);
      if (editorRef.current && result) {
        editorRef.current.innerHTML = result.replace(/```html?|```/g, '').trim();
        handleEditorInput();
      }
    } catch { /* ignore */ }
    setAiLoading(false);
  };

  const handleEditorInput = () => {
    const content = editorRef.current?.innerHTML ?? '';
    syncPage({ content });
    setSelPage(p => ({ ...p, content }));
  };
  const exec = (cmd: string, val?: string) => { document.execCommand(cmd, false, val); editorRef.current?.focus(); };

  const selectSection = (nb: Notebook, sec: Section) => {
    setSelNb(nb); setSelSec(sec);
    const pg = sec.pages[0];
    setSelPage(pg); setPageTitle(pg.title);
    if (editorRef.current) editorRef.current.innerHTML = pg.content;
  };
  const selectPage = (pg: Page) => {
    setSelPage(pg); setPageTitle(pg.title);
    if (editorRef.current) editorRef.current.innerHTML = pg.content;
  };

  // ── Rename helpers ──
  const commitPageRename = (pgId: string) => {
    const title = renameValue.trim() || 'Neue Seite';
    setNotebooks(prev => prev.map(nb =>
      nb.id !== selNb.id ? nb : { ...nb, sections: nb.sections.map(sec =>
        sec.id !== selSec.id ? sec : { ...sec, pages: sec.pages.map(pg => pg.id !== pgId ? pg : { ...pg, title }) }
      )}
    ));
    if (pgId === selPage.id) { setPageTitle(title); setSelPage(p => ({ ...p, title })); }
    setRenamingPageId(null);
  };
  const commitSecRename = (secId: string, nbId: string) => {
    const name = renameValue.trim() || 'Abschnitt';
    setNotebooks(prev => prev.map(nb =>
      nb.id !== nbId ? nb : { ...nb, sections: nb.sections.map(sec => sec.id !== secId ? sec : { ...sec, name }) }
    ));
    if (secId === selSec.id) setSelSec(s => ({ ...s, name }));
    setRenamingSecId(null);
  };
  const commitNbRename = (nbId: string) => {
    const name = renameValue.trim() || 'Notizbuch';
    setNotebooks(prev => prev.map(nb => nb.id !== nbId ? nb : { ...nb, name }));
    if (nbId === selNb.id) setSelNb(n => ({ ...n, name }));
    setRenamingNbId(null);
  };

  // ── CRUD ──
  const addNotebook = () => {
    const name = prompt('Name des neuen Notizbuchs:');
    if (!name?.trim()) return;
    const pg: Page = { id: Date.now() + 'pg', title: 'Neue Seite', content: '', updatedAt: now() };
    const sec: Section = { id: Date.now() + 's', name: 'Allgemein', color: COLORS[notebooks.length % COLORS.length], pages: [pg] };
    const nb: Notebook = { id: Date.now().toString(), name, sections: [sec] };
    setNotebooks(prev => [...prev, nb]);
    setSelNb(nb); setSelSec(sec); setSelPage(pg); setPageTitle(pg.title);
    if (editorRef.current) editorRef.current.innerHTML = '';
  };
  const addSection = () => {
    const name = prompt('Name des neuen Abschnitts:');
    if (!name?.trim()) return;
    const pg: Page = { id: Date.now() + 'pg', title: 'Neue Seite', content: '', updatedAt: now() };
    const sec: Section = { id: Date.now().toString(), name, color: COLORS[selNb.sections.length % COLORS.length], pages: [pg] };
    setNotebooks(prev => prev.map(nb => nb.id !== selNb.id ? nb : { ...nb, sections: [...nb.sections, sec] }));
    setSelNb(nb => ({ ...nb, sections: [...nb.sections, sec] }));
    setSelSec(sec); setSelPage(pg); setPageTitle(pg.title);
    if (editorRef.current) editorRef.current.innerHTML = '';
  };
  const addPage = () => {
    const pg: Page = { id: Date.now().toString(), title: 'Neue Seite', content: '', updatedAt: now() };
    setNotebooks(prev => prev.map(nb => nb.id !== selNb.id ? nb : {
      ...nb, sections: nb.sections.map(sec => sec.id !== selSec.id ? sec : { ...sec, pages: [...sec.pages, pg] })
    }));
    setSelSec(s => ({ ...s, pages: [...s.pages, pg] }));
    setSelPage(pg); setPageTitle(pg.title);
    if (editorRef.current) editorRef.current.innerHTML = '';
  };
  const deletePage = (pageId: string) => {
    const pages = selSec.pages.filter(p => p.id !== pageId);
    if (pages.length === 0) return;
    setNotebooks(prev => prev.map(nb => nb.id !== selNb.id ? nb : {
      ...nb, sections: nb.sections.map(sec => sec.id !== selSec.id ? sec : { ...sec, pages })
    }));
    setSelSec(s => ({ ...s, pages }));
    if (selPage.id === pageId) selectPage(pages[0]);
  };
  const deleteSection = (secId: string, nbId: string) => {
    const nb = notebooks.find(n => n.id === nbId);
    if (!nb || nb.sections.length <= 1) return;
    const sections = nb.sections.filter(s => s.id !== secId);
    setNotebooks(prev => prev.map(n => n.id !== nbId ? n : { ...n, sections }));
    if (selSec.id === secId) {
      const newSec = sections[0];
      setSelNb(n => ({ ...n, sections }));
      setSelSec(newSec);
      const pg = newSec.pages[0];
      setSelPage(pg); setPageTitle(pg.title);
      if (editorRef.current) editorRef.current.innerHTML = pg.content;
    }
  };
  const deleteNotebook = (nbId: string) => {
    if (notebooks.length <= 1) return;
    const updated = notebooks.filter(n => n.id !== nbId);
    setNotebooks(updated);
    if (selNb.id === nbId) {
      const nb = updated[0];
      const sec = nb.sections[0];
      const pg = sec.pages[0];
      setSelNb(nb); setSelSec(sec); setSelPage(pg); setPageTitle(pg.title);
      if (editorRef.current) editorRef.current.innerHTML = pg.content;
    }
  };

  // ── Drag & Drop: Pages ──
  const onPageDragStart = (e: React.DragEvent, pg: Page) => {
    dragItem.current = { type: 'page', pageId: pg.id, fromNbId: selNb.id, fromSecId: selSec.id };
    e.dataTransfer.effectAllowed = 'move';
  };
  const onPageDragOver = (e: React.DragEvent, pgId: string) => {
    e.preventDefault();
    if (dragItem.current?.type === 'page') { setDragOverPageId(pgId); setDragOverSecId(null); }
  };
  const onPageDrop = (e: React.DragEvent, targetPageId: string) => {
    e.preventDefault();
    setDragOverPageId(null);
    const item = dragItem.current;
    if (!item || item.type !== 'page' || item.pageId === targetPageId) { dragItem.current = null; return; }
    // Same section reorder only
    if (item.fromSecId !== selSec.id || item.fromNbId !== selNb.id) { dragItem.current = null; return; }
    dragItem.current = null;

    const pages = [...selSec.pages];
    const fromIdx = pages.findIndex(p => p.id === item.pageId);
    const toIdx = pages.findIndex(p => p.id === targetPageId);
    if (fromIdx === -1 || toIdx === -1) return;
    const [moved] = pages.splice(fromIdx, 1);
    pages.splice(toIdx, 0, moved);

    setNotebooks(prev => prev.map(nb =>
      nb.id !== selNb.id ? nb : {
        ...nb,
        sections: nb.sections.map(sec =>
          sec.id !== selSec.id ? sec : { ...sec, pages }
        ),
      }
    ));
    setSelSec(s => ({ ...s, pages }));
  };

  // Drop page onto a section header → move page to that section
  const onSecDropPage = (e: React.DragEvent, targetNbId: string, targetSecId: string) => {
    e.preventDefault();
    setDragOverSecId(null);
    const item = dragItem.current;
    if (!item || item.type !== 'page' || item.fromSecId === targetSecId) { dragItem.current = null; return; }
    // Prevent emptying source section
    const srcSec = notebooks.find(n => n.id === item.fromNbId)?.sections.find(s => s.id === item.fromSecId);
    if (!srcSec || srcSec.pages.length <= 1) { dragItem.current = null; return; }
    const movedPage = srcSec.pages.find(p => p.id === item.pageId);
    if (!movedPage) { dragItem.current = null; return; }
    dragItem.current = null;

    const updated = notebooks.map(nb => ({
      ...nb,
      sections: nb.sections.map(sec => {
        if (nb.id === item.fromNbId && sec.id === item.fromSecId)
          return { ...sec, pages: sec.pages.filter(p => p.id !== item.pageId) };
        if (nb.id === targetNbId && sec.id === targetSecId)
          return { ...sec, pages: [...sec.pages, movedPage] };
        return sec;
      }),
    }));
    setNotebooks(updated);

    // Navigate to target section so the page is visible
    const targetNb = updated.find(n => n.id === targetNbId);
    const targetSec = targetNb?.sections.find(s => s.id === targetSecId);
    if (targetNb && targetSec) {
      setSelNb(targetNb);
      setSelSec(targetSec);
      const pg = targetSec.pages[targetSec.pages.length - 1];
      setSelPage(pg); setPageTitle(pg.title);
      if (editorRef.current) editorRef.current.innerHTML = pg.content;
    }
  };

  // ── Drag & Drop: Sections ──
  const onSecDragStart = (e: React.DragEvent, sec: Section, nbId: string) => {
    dragItem.current = { type: 'section', secId: sec.id, fromNbId: nbId };
    e.dataTransfer.effectAllowed = 'move';
    e.stopPropagation();
  };
  const onSecDragOver = (e: React.DragEvent, secId: string) => {
    e.preventDefault();
    if (dragItem.current?.type === 'section') { setDragOverSecId(secId); setDragOverPageId(null); }
  };
  const onSecDrop = (e: React.DragEvent, targetSecId: string, targetNbId: string) => {
    e.preventDefault();
    setDragOverSecId(null);
    const item = dragItem.current;
    if (!item || item.type !== 'section' || item.secId === targetSecId || item.fromNbId !== targetNbId) {
      dragItem.current = null; return;
    }
    dragItem.current = null;

    const srcNb = notebooks.find(n => n.id === item.fromNbId);
    if (!srcNb) return;
    const secs = [...srcNb.sections];
    const fromIdx = secs.findIndex(s => s.id === item.secId);
    const toIdx = secs.findIndex(s => s.id === targetSecId);
    if (fromIdx === -1 || toIdx === -1) return;
    const [moved] = secs.splice(fromIdx, 1);
    secs.splice(toIdx, 0, moved);

    setNotebooks(prev => prev.map(nb => nb.id !== targetNbId ? nb : { ...nb, sections: secs }));
    if (item.fromNbId === selNb.id) setSelNb(n => ({ ...n, sections: secs }));
  };

  const createNoteFromImport = (title: string, content: string, fileName: string) => {
    const pg: Page = { id: Date.now() + 'pg', title, content, updatedAt: now() };
    const sec: Section = { id: Date.now() + 's', name: 'Importiert', color: COLORS[notebooks.length % COLORS.length], pages: [pg] };
    const nb: Notebook = { id: Date.now().toString(), name: fileName.replace(/\.[^.]+$/, ''), sections: [sec] };
    setNotebooks(prev => [...prev, nb]);
    setSelNb(nb); setSelSec(sec); setSelPage(pg); setPageTitle(pg.title);
    if (editorRef.current) editorRef.current.innerHTML = pg.content;
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportError(''); e.target.value = '';
    // .pdf
    if (file.name.match(/\.pdf$/i)) {
      try {
        const buffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
        const pages: string[] = [];
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          pages.push(content.items.map((it: any) => it.str).join(' '));
        }
        const html = pages.map((p, i) => `<p><b>Seite ${i + 1}</b></p><p>${p}</p>`).join('<hr>');
        createNoteFromImport(file.name.replace(/\.pdf$/i, ''), html, file.name);
      } catch {
        setImportError('Die PDF-Datei konnte nicht gelesen werden.');
      }
      return;
    }

    // .docx
    if (file.name.match(/\.docx$/i)) {
      try {
        const result = await mammoth.convertToHtml({ arrayBuffer: await file.arrayBuffer() });
        createNoteFromImport(file.name.replace(/\.docx$/i, ''), result.value, file.name);
      } catch { setImportError('Die .docx Datei konnte nicht gelesen werden.'); }
      return;
    }
    if (file.name.match(/\.txt$/i)) {
      const html = (await file.text()).split('\n').map(l => `<p>${l || '<br>'}</p>`).join('');
      createNoteFromImport(file.name.replace(/\.txt$/i, ''), html, file.name);
      return;
    }
    const raw = decodeFile(await file.arrayBuffer());
    if (countReplacementChars(raw) > raw.length * 0.15) {
      setImportError('HTML-Datei konnte nicht gelesen werden. Empfehlung: In OneNote als Word (.docx) exportieren.');
      return;
    }
    const { title, content } = parseOneNoteHtml(raw);
    createNoteFromImport(title, content, file.name);
  };

  const TEXT_COLORS = ['#000000','#ef4444','#f97316','#eab308','#22c55e','#3b82f6','#8b5cf6','#ec4899','#ffffff'];
  const HIGHLIGHT_COLORS = ['#fef08a','#bbf7d0','#bfdbfe','#fecaca','#e9d5ff','#fed7aa'];
  const TOOLBAR = [
    { icon: Bold, cmd: 'bold', title: 'Fett' },
    { icon: Italic, cmd: 'italic', title: 'Kursiv' },
    { icon: Underline, cmd: 'underline', title: 'Unterstrichen' },
    { icon: Strikethrough, cmd: 'strikeThrough', title: 'Durchgestrichen' },
  ];

  const TB = 'p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition';

  return (
    <div className="flex h-full bg-white dark:bg-slate-900" onClick={() => setColorPickerOpen(null)}>
      <input ref={fileInputRef} type="file" accept=".docx,.html,.htm,.txt,.pdf" className="hidden" onChange={handleImportFile} />

      {/* ── Notebooks panel ── */}
      <div className="w-52 border-r border-slate-200 dark:border-slate-700 flex flex-col bg-slate-50 dark:bg-slate-800 flex-shrink-0">
        <div className="p-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t.notes_notebooks}</span>
          <button onClick={addNotebook} className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400"><Plus size={15} /></button>
        </div>

        <div className="flex-1 overflow-y-auto py-1">
          {notebooks.map(nb => (
            <div key={nb.id}>
              {/* Notebook name — double-click to rename */}
              <div className="px-3 py-2 flex items-center gap-1.5 group">
                <BookOpen size={13} className="text-blue-500 flex-shrink-0" />
                {renamingNbId === nb.id ? (
                  <input autoFocus value={renameValue} onChange={e => setRenameValue(e.target.value)}
                    onBlur={() => commitNbRename(nb.id)}
                    onKeyDown={e => { if (e.key === 'Enter') commitNbRename(nb.id); if (e.key === 'Escape') setRenamingNbId(null); }}
                    className="flex-1 text-xs border border-blue-400 rounded px-1 py-0.5 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 min-w-0" />
                ) : (
                  <>
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate flex-1">{nb.name}</span>
                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 flex-shrink-0">
                      <button onClick={() => { setRenamingNbId(nb.id); setRenameValue(nb.name); }}
                        className="p-0.5 rounded hover:text-blue-500 text-slate-400 transition"><Pencil size={10} /></button>
                      {notebooks.length > 1 && (
                        <button onClick={() => { if (window.confirm(`Notizbuch "${nb.name}" löschen?`)) deleteNotebook(nb.id); }}
                          className="p-0.5 rounded hover:text-red-500 text-slate-400 transition"><Trash2 size={10} /></button>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Sections — draggable */}
              {nb.sections.map(sec => (
                <div
                  key={sec.id}
                  draggable
                  onDragStart={e => onSecDragStart(e, sec, nb.id)}
                  onDragOver={e => onSecDragOver(e, sec.id)}
                  onDragLeave={() => setDragOverSecId(null)}
                  onDrop={e => {
                    if (dragItem.current?.type === 'section') onSecDrop(e, sec.id, nb.id);
                    else onSecDropPage(e, nb.id, sec.id);
                  }}
                  className={`group w-full pl-4 pr-2 py-1.5 flex items-center gap-1.5 text-left transition-colors cursor-pointer ${
                    dragOverSecId === sec.id ? 'bg-blue-100 dark:bg-blue-900/50' :
                    selSec.id === sec.id ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' :
                    'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                  onClick={() => renamingSecId !== sec.id && selectSection(nb, sec)}
                >
                  <GripVertical size={10} className="text-slate-300 dark:text-slate-600 flex-shrink-0 cursor-grab" />
                  <span className={`w-2.5 h-2.5 rounded-sm flex-shrink-0 ${sec.color}`} />
                  {renamingSecId === sec.id ? (
                    <input autoFocus value={renameValue} onChange={e => setRenameValue(e.target.value)}
                      onBlur={() => commitSecRename(sec.id, nb.id)}
                      onKeyDown={e => { if (e.key === 'Enter') commitSecRename(sec.id, nb.id); if (e.key === 'Escape') setRenamingSecId(null); }}
                      onClick={e => e.stopPropagation()}
                      className="flex-1 text-xs border border-blue-400 rounded px-1 py-0.5 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 min-w-0" />
                  ) : (
                    <>
                      <span className="text-xs truncate flex-1">{sec.name}</span>
                      <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 flex-shrink-0">
                        <button onClick={e => { e.stopPropagation(); setRenamingSecId(sec.id); setRenameValue(sec.name); }}
                          className="p-0.5 rounded hover:text-blue-500 text-slate-400 transition"><Pencil size={10} /></button>
                        {nb.sections.length > 1 && (
                          <button onClick={e => { e.stopPropagation(); if (window.confirm(`Abschnitt "${sec.name}" löschen?`)) deleteSection(sec.id, nb.id); }}
                            className="p-0.5 rounded hover:text-red-500 text-slate-400 transition"><Trash2 size={10} /></button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="p-2 border-t border-slate-200 dark:border-slate-700 space-y-1">
          {importError && <div className="text-xs text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-2 py-1.5 leading-snug">{importError}</div>}

          {showImportHelp && (
            <div className="bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg p-3 text-xs space-y-2">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-slate-700 dark:text-slate-200">Import-Hilfe</span>
                <button onClick={() => setShowImportHelp(false)} className="text-slate-400 hover:text-slate-600"><X size={13} /></button>
              </div>
              <div>
                <p className="font-medium text-green-700 dark:text-green-400 mb-1">✓ Funktioniert:</p>
                <ul className="space-y-1 text-slate-600 dark:text-slate-300">
                  <li><b>.docx</b> — Word (empfohlen für OneNote)</li>
                  <li><b>.txt</b> — Einfacher Text</li>
                  <li><b>.html</b> — Webseiten</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-red-600 dark:text-red-400 mb-1">✗ Funktioniert nicht:</p>
                <ul className="space-y-1 text-slate-600 dark:text-slate-300">
                  <li><b>.pdf</b> — OneNote-PDFs haben keinen lesbaren Text</li>
                </ul>
              </div>
              <div className="pt-1 border-t border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400">
                <p className="font-medium mb-1">OneNote exportieren:</p>
                <p>Datei → Exportieren → Seite → <b>Word (.docx)</b></p>
              </div>
            </div>
          )}

          <div className="flex gap-1">
            <button onClick={() => { setImportError(''); fileInputRef.current?.click(); }}
              className="flex-1 flex items-center gap-2 px-3 py-2 text-xs text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/40 transition font-medium">
              <Upload size={13} /> {t.notes_import}
            </button>
            <button onClick={() => setShowImportHelp(h => !h)}
              title="Import-Hilfe"
              className={`px-2 py-2 rounded-lg border transition text-xs ${showImportHelp ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-300' : 'border-slate-200 dark:border-slate-600 text-slate-400 hover:text-blue-500 hover:border-blue-300'}`}>
              <HelpCircle size={13} />
            </button>
          </div>
          <button onClick={addSection}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition">
            <Plus size={13} /> {t.notes_add_section}
          </button>
        </div>
      </div>

      {/* ── Pages panel ── */}
      <div className="w-44 border-r border-slate-200 dark:border-slate-700 flex flex-col flex-shrink-0 bg-white dark:bg-slate-900">
        <div className="p-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className={`w-2.5 h-2.5 rounded-sm flex-shrink-0 ${selSec.color}`} />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">{selSec.name}</span>
          </div>
          <button onClick={addPage} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400"><Plus size={15} /></button>
        </div>

        <div className="flex-1 overflow-y-auto py-1"
          onDragOver={e => { if (dragItem.current?.type === 'page') e.preventDefault(); }}
          onDrop={e => {
            const item = dragItem.current;
            if (item?.type === 'page' && !dragOverPageId) {
              // Dropped on empty space → append
              onPageDrop(e, selSec.pages[selSec.pages.length - 1]?.id ?? '');
            }
          }}
        >
          {selSec.pages.map(pg => (
            <div
              key={pg.id}
              draggable
              onDragStart={e => onPageDragStart(e, pg)}
              onDragOver={e => onPageDragOver(e, pg.id)}
              onDragLeave={() => setDragOverPageId(null)}
              onDrop={e => onPageDrop(e, pg.id)}
              onClick={() => renamingPageId !== pg.id && selectPage(pg)}
              className={`group flex items-center px-2 py-1.5 cursor-pointer transition-colors ${
                dragOverPageId === pg.id ? 'border-t-2 border-blue-400' : ''
              } ${
                selPage.id === pg.id
                  ? 'bg-blue-50 dark:bg-blue-900/30 border-l-2 border-blue-500'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800 border-l-2 border-transparent'
              }`}
            >
              <GripVertical size={10} className="text-slate-300 dark:text-slate-600 flex-shrink-0 mr-1 cursor-grab" />
              <FileText size={12} className="text-slate-400 flex-shrink-0 mr-1" />
              {renamingPageId === pg.id ? (
                <input autoFocus value={renameValue} onChange={e => setRenameValue(e.target.value)}
                  onBlur={() => commitPageRename(pg.id)}
                  onKeyDown={e => { if (e.key === 'Enter') commitPageRename(pg.id); if (e.key === 'Escape') setRenamingPageId(null); }}
                  onClick={e => e.stopPropagation()}
                  className="flex-1 text-xs border border-blue-400 rounded px-1 py-0.5 outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 min-w-0" />
              ) : (
                <>
                  <span className="text-xs text-slate-700 dark:text-slate-300 flex-1 truncate">{pg.title}</span>
                  <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 flex-shrink-0">
                    <button onClick={e => { e.stopPropagation(); setRenamingPageId(pg.id); setRenameValue(pg.title); }}
                      className="p-0.5 rounded hover:text-blue-500 text-slate-400 transition"><Pencil size={10} /></button>
                    {selSec.pages.length > 1 && (
                      <button onClick={e => { e.stopPropagation(); deletePage(pg.id); }}
                        className="p-0.5 rounded hover:text-red-500 text-slate-400 transition"><Trash2 size={10} /></button>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Editor ── */}
      <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-slate-900">
        <div className="px-6 pt-4 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
            <span>{selNb.name}</span><ChevronRight size={12} /><span>{selSec.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleAiStructure} disabled={aiLoading}
              title="Text mit KI strukturieren"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition bg-purple-500 hover:bg-purple-600 disabled:opacity-50 text-white">
              {aiLoading ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
              KI strukturieren
            </button>
            <button onClick={handleSave} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              saved ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}>
              {saved ? <><Check size={13} /> Gespeichert</> : <><Save size={13} /> Speichern</>}
            </button>
          </div>
        </div>

        <div className="px-6 pb-2">
          <input value={pageTitle} onChange={e => setPageTitle(e.target.value)} onBlur={handleTitleBlur}
            placeholder={t.notes_title_placeholder}
            className="w-full text-3xl font-bold text-slate-900 dark:text-slate-100 border-none outline-none bg-transparent placeholder-slate-300 dark:placeholder-slate-600" />
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{t.notes_last_edited} {selPage.updatedAt}</p>
        </div>

        <div className="px-4 py-1.5 border-y border-slate-100 dark:border-slate-700 flex items-center gap-0.5 flex-wrap bg-slate-50 dark:bg-slate-800" onClick={e => e.stopPropagation()}>
          <button onMouseDown={e => { e.preventDefault(); exec('undo'); }} title="Rückgängig" className={TB}><Undo2 size={15} /></button>
          <button onMouseDown={e => { e.preventDefault(); exec('redo'); }} title="Wiederholen" className={TB}><Redo2 size={15} /></button>
          <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1" />
          <select onMouseDown={e => e.stopPropagation()} onChange={e => { exec('fontSize', e.target.value); e.target.value = ''; }} defaultValue=""
            className="text-xs px-1 py-1 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer" title="Schriftgrösse">
            <option value="" disabled>Grösse</option>
            <option value="1">Klein (8pt)</option><option value="2">Klein (10pt)</option>
            <option value="3">Normal (12pt)</option><option value="4">Mittel (14pt)</option>
            <option value="5">Gross (18pt)</option><option value="6">Sehr gross (24pt)</option>
            <option value="7">Riesig (36pt)</option>
          </select>
          <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1" />
          {TOOLBAR.map(({ icon: Icon, cmd, title }) => (
            <button key={cmd} onMouseDown={e => { e.preventDefault(); exec(cmd); }} title={title} className={TB}><Icon size={15} /></button>
          ))}
          <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1" />
          {(['h1', 'h2', 'h3'] as const).map(tag => (
            <button key={tag} onMouseDown={e => { e.preventDefault(); exec('formatBlock', tag); }}
              className={`${TB} text-xs font-bold uppercase`}>{tag}</button>
          ))}
          <button onMouseDown={e => { e.preventDefault(); exec('formatBlock', 'p'); }} title="Normal" className={TB}><Type size={15} /></button>
          <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1" />
          <button onMouseDown={e => { e.preventDefault(); exec('justifyLeft'); }} title="Links" className={TB}><AlignLeft size={15} /></button>
          <button onMouseDown={e => { e.preventDefault(); exec('justifyCenter'); }} title="Zentriert" className={TB}><AlignCenter size={15} /></button>
          <button onMouseDown={e => { e.preventDefault(); exec('justifyRight'); }} title="Rechts" className={TB}><AlignRight size={15} /></button>
          <button onMouseDown={e => { e.preventDefault(); exec('justifyFull'); }} title="Blocksatz" className={TB}><AlignJustify size={15} /></button>
          <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1" />
          <button onMouseDown={e => { e.preventDefault(); exec('insertUnorderedList'); }} title="Aufzählung" className={TB}><List size={15} /></button>
          <button onMouseDown={e => { e.preventDefault(); exec('insertOrderedList'); }} title="Nummerierung" className={TB}><ListOrdered size={15} /></button>
          <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1" />

          {/* Text color */}
          <div className="relative">
            <button onMouseDown={e => { e.preventDefault(); e.stopPropagation(); setColorPickerOpen(o => o === 'text' ? null : 'text'); }}
              title="Textfarbe" className={`${TB} flex items-center gap-0.5 text-xs font-bold`}>
              A<span className="w-3 h-1 rounded-sm bg-red-500 block" />
            </button>
            {colorPickerOpen === 'text' && (
              <div className="absolute top-9 left-0 z-30 flex flex-wrap gap-1 p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl w-28" onClick={e => e.stopPropagation()}>
                {TEXT_COLORS.map(c => (
                  <button key={c} onMouseDown={e => { e.preventDefault(); exec('foreColor', c); setColorPickerOpen(null); }}
                    className="w-6 h-6 rounded-full border-2 border-slate-300 hover:scale-125 transition-transform" style={{ backgroundColor: c }} />
                ))}
              </div>
            )}
          </div>

          {/* Highlight */}
          <div className="relative">
            <button onMouseDown={e => { e.preventDefault(); e.stopPropagation(); setColorPickerOpen(o => o === 'highlight' ? null : 'highlight'); }}
              title="Markieren" className={TB}><Highlighter size={15} /></button>
            {colorPickerOpen === 'highlight' && (
              <div className="absolute top-9 left-0 z-30 flex flex-wrap gap-1 p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl w-24" onClick={e => e.stopPropagation()}>
                {HIGHLIGHT_COLORS.map(c => (
                  <button key={c} onMouseDown={e => { e.preventDefault(); exec('hiliteColor', c); setColorPickerOpen(null); }}
                    className="w-6 h-6 rounded border-2 border-slate-300 hover:scale-125 transition-transform" style={{ backgroundColor: c }} />
                ))}
              </div>
            )}
          </div>
        </div>

        <div ref={editorRef} contentEditable suppressContentEditableWarning onInput={handleEditorInput}
          className="flex-1 px-6 py-4 overflow-y-auto outline-none text-slate-800 dark:text-slate-200 text-sm leading-relaxed
            [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-slate-900 dark:[&_h1]:text-slate-100 [&_h1]:mb-3 [&_h1]:mt-4
            [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-slate-800 dark:[&_h2]:text-slate-200 [&_h2]:mb-2 [&_h2]:mt-3
            [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-slate-700 dark:[&_h3]:text-slate-300 [&_h3]:mb-2 [&_h3]:mt-3
            [&_ul]:list-disc [&_ul]:ml-5 [&_ul]:mb-2 [&_ul]:space-y-1
            [&_ol]:list-decimal [&_ol]:ml-5 [&_ol]:mb-2 [&_ol]:space-y-1
            [&_p]:mb-2 [&_p]:min-h-[1.5em]
            [&_table]:border-collapse [&_table]:w-full [&_td]:border [&_td]:border-slate-300 dark:[&_td]:border-slate-600 [&_td]:p-2
            [&_th]:border [&_th]:border-slate-300 dark:[&_th]:border-slate-600 [&_th]:p-2 [&_th]:bg-slate-50 dark:[&_th]:bg-slate-700"
          spellCheck />
      </div>
    </div>
  );
}
