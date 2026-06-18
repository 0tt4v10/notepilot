import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Loader2, AlertCircle, Send, RotateCcw } from 'lucide-react';
import * as ai from '../services/aiService';
import { useLanguage } from '../LanguageContext';

type Mode = 'summary' | 'questions' | 'gaps' | 'chat';

interface ChatMsg {
  role: 'user' | 'assistant';
  content: string;
}

interface Props {
  noteText: string;
  onClose: () => void;
}

export default function AiPanel({ noteText, onClose }: Props) {
  const { t } = useLanguage();
  const [mode, setMode] = useState<Mode>('summary');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [chatMsgs, setChatMsgs] = useState<ChatMsg[]>([]);
  const [chatInput, setChatInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const MODES: { id: Mode; label: string; emoji: string }[] = [
    { id: 'summary', label: t.ai_summary, emoji: '📝' },
    { id: 'questions', label: t.ai_questions, emoji: '❓' },
    { id: 'gaps', label: t.ai_gaps, emoji: '🔍' },
    { id: 'chat', label: t.ai_chat, emoji: '💬' },
  ];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMsgs, result]);

  const plainText = noteText.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

  const runMode = async (m: Mode) => {
    if (!plainText) { setError(t.ai_empty_note); return; }
    setMode(m);
    if (m === 'chat') { setError(''); return; }
    setLoading(true);
    setResult('');
    setError('');
    try {
      let res = '';
      if (m === 'summary') res = await ai.summarize(plainText);
      if (m === 'questions') res = await ai.generateExamQuestions(plainText);
      if (m === 'gaps') res = await ai.findGaps(plainText);
      setResult(res);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unbekannter Fehler');
    } finally {
      setLoading(false);
    }
  };

  const sendChat = async () => {
    const text = chatInput.trim();
    if (!text || loading) return;
    const next: ChatMsg[] = [...chatMsgs, { role: 'user', content: text }];
    setChatMsgs(next);
    setChatInput('');
    setLoading(true);
    setError('');
    try {
      const reply = await ai.chat(plainText, next);
      setChatMsgs(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Fehler');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-80 border-l border-slate-200 dark:border-slate-700 flex flex-col bg-white dark:bg-slate-800">
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-800 dark:to-slate-800">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-blue-500" />
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{t.ai_assistant}</span>
        </div>
        <button onClick={onClose} className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400">
          <X size={15} />
        </button>
      </div>

      <div className="grid grid-cols-4 border-b border-slate-200 dark:border-slate-700">
        {MODES.map(m => (
          <button
            key={m.id}
            onClick={() => runMode(m.id)}
            className={`py-2 flex flex-col items-center gap-0.5 text-xs transition-colors ${
              mode === m.id
                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-b-2 border-blue-500'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            <span>{m.emoji}</span>
            <span className="leading-tight text-center px-0.5">{m.label}</span>
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {mode !== 'chat' ? (
          <div className="p-4">
            {loading && (
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
                <Loader2 size={16} className="animate-spin" />
                {t.ai_analyzing}
              </div>
            )}
            {error && (
              <div className="flex items-start gap-2 text-red-600 text-sm bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
                <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
                {error}
              </div>
            )}
            {result && !loading && (
              <div className="text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">{result}</div>
            )}
            {!loading && !result && !error && (
              <p className="text-slate-400 dark:text-slate-500 text-sm text-center mt-8">{t.ai_select_mode}</p>
            )}
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {chatMsgs.length === 0 && (
                <p className="text-slate-400 dark:text-slate-500 text-sm text-center mt-6">{t.ai_ask_note}</p>
              )}
              {chatMsgs.map((msg, i) => (
                <div key={i} className={`rounded-lg px-3 py-2 text-sm ${
                  msg.role === 'user'
                    ? 'bg-blue-500 text-white ml-6'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 mr-6'
                }`}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              ))}
              {loading && (
                <div className="bg-slate-100 dark:bg-slate-700 rounded-lg px-3 py-2 mr-6 flex items-center gap-2 text-slate-400 dark:text-slate-500 text-sm">
                  <Loader2 size={14} className="animate-spin" />
                  {t.popup_answering}
                </div>
              )}
              {error && <div className="text-red-500 text-xs bg-red-50 dark:bg-red-900/20 rounded p-2">{error}</div>}
              <div ref={bottomRef} />
            </div>
            {chatMsgs.length > 0 && (
              <button
                onClick={() => setChatMsgs([])}
                className="mx-3 mb-1 flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <RotateCcw size={11} /> {t.ai_reset}
              </button>
            )}
            <div className="p-3 border-t border-slate-200 dark:border-slate-700 flex gap-2">
              <input
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendChat()}
                placeholder={t.ai_placeholder}
                disabled={loading}
                className="flex-1 text-sm px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
              />
              <button
                onClick={sendChat}
                disabled={loading || !chatInput.trim()}
                className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-40 transition"
              >
                <Send size={15} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
