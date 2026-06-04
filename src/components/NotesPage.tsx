import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  BookOpen, Plus, Trash2, Bold, Italic, Underline,
  List, ListOrdered, Type, ChevronRight, FileText,
  Upload,
} from 'lucide-react';
import mammoth from 'mammoth';

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

const COLORS = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500', 'bg-pink-500'];

const DEFAULT_NOTEBOOKS: Notebook[] = [
  {
    id: '1',
    name: 'Mathematik',
    sections: [
      {
        id: 's1', name: 'Analysis', color: 'bg-blue-500',
        pages: [
          {
            id: 'p1', title: 'Ableitungsregeln', updatedAt: '2026-05-07',
            content: '<h2>Ableitungsregeln</h2><p>Die wichtigsten Ableitungsregeln:</p><ul><li><b>Potenzregel:</b> f(x) = xⁿ → f\'(x) = n·xⁿ⁻¹</li><li><b>Kettenregel:</b> (f∘g)\' = f\'(g(x))·g\'(x)</li><li><b>Produktregel:</b> (f·g)\' = f\'·g + f·g\'</li></ul>',
          },
        ],
      },
    ],
  },
];

function now() { return new Date().toISOString().slice(0, 10); }

function countReplacementChars(s: string): number {
  let n = 0;
  for (let i = 0; i < s.length; i++) {
    if (s.charCodeAt(i) === 0xFFFD) n++;
  }
  return n;
}

function decodeFile(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);

  // BOM-based detection
  if (bytes[0] === 0xFF && bytes[1] === 0xFE) {
    return new TextDecoder('utf-16le').decode(buffer.slice(2));
  }
  if (bytes[0] === 0xFE && bytes[1] === 0xFF) {
    return new TextDecoder('utf-16be').decode(buffer.slice(2));
  }
  if (bytes[0] === 0xEF && bytes[1] === 0xBB && bytes[2] === 0xBF) {
    return new TextDecoder('utf-8').decode(buffer.slice(3));
  }

  // Heuristic: UTF-16 LE without BOM
  // In UTF-16 LE, ASCII chars produce alternating 0x00 bytes at odd positions
  const nullsAtOdd = [1, 3, 5, 7, 9, 11, 13, 15].filter(i => bytes[i] === 0x00).length;
  if (nullsAtOdd >= 6) {
    return new TextDecoder('utf-16le').decode(buffer);
  }

  // Try UTF-8 vs Windows-1252 — use whichever produces fewer replacement characters
  const asUtf8 = new TextDecoder('utf-8').decode(buffer);
  const asW1252 = new TextDecoder('windows-1252').decode(buffer);
  return countReplacementChars(asUtf8) <= countReplacementChars(asW1252) ? asUtf8 : asW1252;
}

function parseOneNoteHtml(html: string): { title: string; content: string } {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  doc.querySelectorAll('script, style, link').forEach(el => el.remove());
  const title = doc.title || doc.querySelector('h1')?.textContent || 'Importierte Notiz';
  const body = doc.body?.innerHTML ?? html;
  return { title: title.trim(), content: body };
}

export default function NotesPage() {
  const [notebooks, setNotebooks] = useState<Notebook[]>(DEFAULT_NOTEBOOKS);
  const [selNb, setSelNb] = useState<Notebook>(DEFAULT_NOTEBOOKS[0]);
  const [selSec, setSelSec] = useState<Section>(DEFAULT_NOTEBOOKS[0].sections[0]);
  const [selPage, setSelPage] = useState<Page>(DEFAULT_NOTEBOOKS[0].sections[0].pages[0]);
  const [pageTitle, setPageTitle] = useState(selPage.title);
  const [importError, setImportError] = useState('');
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Set editor content only when the selected page changes — never on every render.
  // This prevents React from resetting the cursor position while typing.
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = selPage.content;
    }
  }, [selPage.id]); // eslint-disable-line react-hooks/exhaustive-deps

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

  const handleTitleBlur = () => {
    syncPage({ title: pageTitle });
    setSelPage(p => ({ ...p, title: pageTitle }));
  };

  const handleEditorInput = () => {
    const content = editorRef.current?.innerHTML ?? '';
    syncPage({ content });
    setSelPage(p => ({ ...p, content }));
  };

  const exec = (cmd: string, val?: string) => {
    document.execCommand(cmd, false, val);
    editorRef.current?.focus();
  };

  const selectSection = (nb: Notebook, sec: Section) => {
    setSelNb(nb);
    setSelSec(sec);
    const pg = sec.pages[0];
    setSelPage(pg);
    setPageTitle(pg.title);
    if (editorRef.current) editorRef.current.innerHTML = pg.content;
  };

  const selectPage = (pg: Page) => {
    setSelPage(pg);
    setPageTitle(pg.title);
    if (editorRef.current) editorRef.current.innerHTML = pg.content;
  };

  const addNotebook = () => {
    const name = prompt('Name des neuen Notizbuchs:');
    if (!name?.trim()) return;
    const pg: Page = { id: Date.now() + 'pg', title: 'Neue Seite', content: '', updatedAt: now() };
    const sec: Section = { id: Date.now() + 's', name: 'Allgemein', color: COLORS[notebooks.length % COLORS.length], pages: [pg] };
    const nb: Notebook = { id: Date.now().toString(), name, sections: [sec] };
    setNotebooks(prev => [...prev, nb]);
    setSelNb(nb); setSelSec(sec); setSelPage(pg);
    setPageTitle(pg.title);
    if (editorRef.current) editorRef.current.innerHTML = '';
  };

  const addSection = () => {
    const name = prompt('Name des neuen Abschnitts:');
    if (!name?.trim()) return;
    const pg: Page = { id: Date.now() + 'pg', title: 'Neue Seite', content: '', updatedAt: now() };
    const sec: Section = { id: Date.now().toString(), name, color: COLORS[selNb.sections.length % COLORS.length], pages: [pg] };
    setNotebooks(prev => prev.map(nb =>
      nb.id !== selNb.id ? nb : { ...nb, sections: [...nb.sections, sec] }
    ));
    setSelNb(nb => ({ ...nb, sections: [...nb.sections, sec] }));
    setSelSec(sec); setSelPage(pg);
    setPageTitle(pg.title);
    if (editorRef.current) editorRef.current.innerHTML = '';
  };

  const addPage = () => {
    const pg: Page = { id: Date.now().toString(), title: 'Neue Seite', content: '', updatedAt: now() };
    setNotebooks(prev => prev.map(nb =>
      nb.id !== selNb.id ? nb : {
        ...nb,
        sections: nb.sections.map(sec =>
          sec.id !== selSec.id ? sec : { ...sec, pages: [...sec.pages, pg] }
        ),
      }
    ));
    setSelSec(s => ({ ...s, pages: [...s.pages, pg] }));
    setSelPage(pg); setPageTitle(pg.title);
    if (editorRef.current) editorRef.current.innerHTML = '';
  };

  const deletePage = (pageId: string) => {
    const pages = selSec.pages.filter(p => p.id !== pageId);
    if (pages.length === 0) return;
    setNotebooks(prev => prev.map(nb =>
      nb.id !== selNb.id ? nb : {
        ...nb,
        sections: nb.sections.map(sec =>
          sec.id !== selSec.id ? sec : { ...sec, pages }
        ),
      }
    ));
    setSelSec(s => ({ ...s, pages }));
    selectPage(pages[0]);
  };

  const createNoteFromImport = (title: string, content: string, fileName: string) => {
    const pg: Page = { id: Date.now() + 'pg', title, content, updatedAt: now() };
    const sec: Section = {
      id: Date.now() + 's',
      name: 'Importiert',
      color: COLORS[notebooks.length % COLORS.length],
      pages: [pg],
    };
    const nbName = fileName.replace(/\.[^.]+$/, '');
    const nb: Notebook = { id: Date.now().toString(), name: nbName, sections: [sec] };
    setNotebooks(prev => [...prev, nb]);
    setSelNb(nb); setSelSec(sec); setSelPage(pg);
    setPageTitle(pg.title);
    if (editorRef.current) editorRef.current.innerHTML = pg.content;
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportError('');
    e.target.value = '';

    // .docx — most reliable OneNote export format
    if (file.name.match(/\.docx$/i)) {
      try {
        const buffer = await file.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer: buffer });
        const title = file.name.replace(/\.docx$/i, '');
        createNoteFromImport(title, result.value, file.name);
      } catch {
        setImportError('Die .docx Datei konnte nicht gelesen werden.');
      }
      return;
    }

    // .txt — plain text
    if (file.name.match(/\.txt$/i)) {
      const text = await file.text();
      const html = text.split('\n').map(l => `<p>${l || '<br>'}</p>`).join('');
      createNoteFromImport(file.name.replace(/\.txt$/i, ''), html, file.name);
      return;
    }

    // .html / .htm — try multiple encodings
    const buffer = await file.arrayBuffer();
    const raw = decodeFile(buffer);

    if (countReplacementChars(raw) > raw.length * 0.15) {
      setImportError(
        'HTML-Datei konnte nicht gelesen werden. ' +
        'Empfehlung: In OneNote als Word (.docx) exportieren: Datei → Exportieren → Seite → Word'
      );
      return;
    }

    const { title, content } = parseOneNoteHtml(raw);
    createNoteFromImport(title, content, file.name);
  };

  const TOOLBAR = [
    { icon: Bold, cmd: 'bold', title: 'Fett' },
    { icon: Italic, cmd: 'italic', title: 'Kursiv' },
    { icon: Underline, cmd: 'underline', title: 'Unterstrichen' },
  ];

  return (
    <div className="flex h-full bg-white">
      <input
        ref={fileInputRef}
        type="file"
        accept=".docx,.html,.htm,.txt"
        className="hidden"
        onChange={handleImportFile}
      />

      {/* Notebooks panel */}
      <div className="w-52 border-r border-slate-200 flex flex-col bg-slate-50 flex-shrink-0">
        <div className="p-3 border-b border-slate-200 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Notizbücher</span>
          <button onClick={addNotebook} className="p-1 rounded hover:bg-slate-200 text-slate-500" title="Neu">
            <Plus size={15} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-1">
          {notebooks.map(nb => (
            <div key={nb.id}>
              <div className="px-3 py-2 flex items-center gap-2">
                <BookOpen size={13} className="text-blue-500 flex-shrink-0" />
                <span className="text-sm font-semibold text-slate-700 truncate">{nb.name}</span>
              </div>
              {nb.sections.map(sec => (
                <button
                  key={sec.id}
                  onClick={() => selectSection(nb, sec)}
                  className={`w-full pl-7 pr-3 py-1.5 flex items-center gap-2 text-left transition-colors ${
                    selSec.id === sec.id ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span className={`w-2.5 h-2.5 rounded-sm flex-shrink-0 ${sec.color}`} />
                  <span className="text-xs truncate">{sec.name}</span>
                </button>
              ))}
            </div>
          ))}
        </div>

        <div className="p-2 border-t border-slate-200 space-y-1">
          {importError && (
            <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-2 py-1.5 leading-snug">
              {importError}
            </div>
          )}
          <button
            onClick={() => { setImportError(''); fileInputRef.current?.click(); }}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition font-medium"
          >
            <Upload size={13} /> OneNote importieren
          </button>
          <button
            onClick={addSection}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition"
          >
            <Plus size={13} /> Abschnitt
          </button>
        </div>
      </div>

      {/* Pages panel */}
      <div className="w-44 border-r border-slate-200 flex flex-col bg-white flex-shrink-0">
        <div className="p-3 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className={`w-2.5 h-2.5 rounded-sm flex-shrink-0 ${selSec.color}`} />
            <span className="text-xs font-semibold text-slate-700 truncate">{selSec.name}</span>
          </div>
          <button onClick={addPage} className="p-1 rounded hover:bg-slate-100 text-slate-500" title="Seite hinzufügen">
            <Plus size={15} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto py-1">
          {selSec.pages.map(pg => (
            <div
              key={pg.id}
              onClick={() => selectPage(pg)}
              className={`group flex items-center px-3 py-2 cursor-pointer transition-colors ${
                selPage.id === pg.id
                  ? 'bg-blue-50 border-l-2 border-blue-500'
                  : 'hover:bg-slate-50 border-l-2 border-transparent'
              }`}
            >
              <FileText size={12} className="text-slate-400 flex-shrink-0 mr-2" />
              <span className="text-xs text-slate-700 flex-1 truncate">{pg.title}</span>
              {selSec.pages.length > 1 && (
                <button
                  onClick={e => { e.stopPropagation(); deletePage(pg.id); }}
                  className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:text-red-500 text-slate-400 transition"
                >
                  <Trash2 size={11} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="px-6 pt-4 pb-2 flex items-center gap-1 text-xs text-slate-400">
          <span>{selNb.name}</span>
          <ChevronRight size={12} />
          <span>{selSec.name}</span>
        </div>

        <div className="px-6 pb-2">
          <input
            value={pageTitle}
            onChange={e => setPageTitle(e.target.value)}
            onBlur={handleTitleBlur}
            placeholder="Seitentitel..."
            className="w-full text-3xl font-bold text-slate-900 border-none outline-none bg-transparent placeholder-slate-300"
          />
          <p className="text-xs text-slate-400 mt-1">Zuletzt bearbeitet: {selPage.updatedAt}</p>
        </div>

        <div className="px-6 py-2 border-y border-slate-100 flex items-center gap-1 flex-wrap">
          {TOOLBAR.map(({ icon: Icon, cmd, title }) => (
            <button
              key={cmd}
              onMouseDown={e => { e.preventDefault(); exec(cmd); }}
              title={title}
              className="p-1.5 rounded hover:bg-slate-100 text-slate-600 transition"
            >
              <Icon size={16} />
            </button>
          ))}
          <div className="w-px h-5 bg-slate-200 mx-1" />
          {(['h1', 'h2', 'h3'] as const).map(tag => (
            <button
              key={tag}
              onMouseDown={e => { e.preventDefault(); exec('formatBlock', tag); }}
              className="p-1.5 rounded hover:bg-slate-100 text-slate-600 transition text-xs font-bold uppercase"
            >
              {tag}
            </button>
          ))}
          <button onMouseDown={e => { e.preventDefault(); exec('formatBlock', 'p'); }} title="Normal" className="p-1.5 rounded hover:bg-slate-100 text-slate-600 transition">
            <Type size={16} />
          </button>
          <div className="w-px h-5 bg-slate-200 mx-1" />
          <button onMouseDown={e => { e.preventDefault(); exec('insertUnorderedList'); }} title="Aufzählung" className="p-1.5 rounded hover:bg-slate-100 text-slate-600 transition">
            <List size={16} />
          </button>
          <button onMouseDown={e => { e.preventDefault(); exec('insertOrderedList'); }} title="Nummerierung" className="p-1.5 rounded hover:bg-slate-100 text-slate-600 transition">
            <ListOrdered size={16} />
          </button>
        </div>

        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleEditorInput}
          className="flex-1 px-6 py-4 overflow-y-auto outline-none text-slate-800 text-sm leading-relaxed
            [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-slate-900 [&_h1]:mb-3 [&_h1]:mt-4
            [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-slate-800 [&_h2]:mb-2 [&_h2]:mt-3
            [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-slate-700 [&_h3]:mb-2 [&_h3]:mt-3
            [&_ul]:list-disc [&_ul]:ml-5 [&_ul]:mb-2 [&_ul]:space-y-1
            [&_ol]:list-decimal [&_ol]:ml-5 [&_ol]:mb-2 [&_ol]:space-y-1
            [&_p]:mb-2 [&_p]:min-h-[1.5em]
            [&_table]:border-collapse [&_table]:w-full [&_td]:border [&_td]:border-slate-300 [&_td]:p-2
            [&_th]:border [&_th]:border-slate-300 [&_th]:p-2 [&_th]:bg-slate-50"
          spellCheck
        />
      </div>
    </div>
  );
}
