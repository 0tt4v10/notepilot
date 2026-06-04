import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, Loader2, RotateCcw, Minimize2 } from 'lucide-react';
import { chat } from '../services/aiService';

interface Msg {
  role: 'user' | 'assistant';
  content: string;
}

export default function AiChatPopup() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs, loading]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const next: Msg[] = [...msgs, { role: 'user', content: text }];
    setMsgs(next);
    setInput('');
    setLoading(true);
    setError('');
    try {
      const reply = await chat('', next);
      setMsgs(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Fehler');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(o => !o)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 ${
          open
            ? 'bg-slate-700 hover:bg-slate-800'
            : 'bg-blue-500 hover:bg-blue-600 hover:scale-110'
        }`}
      >
        {open ? <X size={22} className="text-white" /> : <Sparkles size={22} className="text-white" />}
      </button>

      {/* Chat popup */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 rounded-2xl shadow-2xl border border-slate-200 flex flex-col bg-white overflow-hidden"
          style={{ height: '460px' }}>

          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-white opacity-90" />
              <span className="text-white font-semibold text-sm">KI-Assistent</span>
            </div>
            <div className="flex items-center gap-1">
              {msgs.length > 0 && (
                <button
                  onClick={() => { setMsgs([]); setError(''); }}
                  title="Gespräch zurücksetzen"
                  className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition"
                >
                  <RotateCcw size={14} />
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition"
              >
                <Minimize2 size={14} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
            {msgs.length === 0 && !loading && (
              <div className="flex flex-col items-center justify-center h-full text-center gap-3 pb-4">
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
                  <Sparkles size={22} className="text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">Wie kann ich helfen?</p>
                  <p className="text-xs text-slate-400 mt-1">Stell mir eine Frage zu deinen Notizen oder zum Lernstoff.</p>
                </div>
                <div className="flex flex-col gap-1.5 w-full mt-1">
                  {['Erkläre mir dieses Konzept...', 'Erstelle Prüfungsfragen zu...', 'Fasse zusammen...'].map(s => (
                    <button
                      key={s}
                      onClick={() => setInput(s)}
                      className="text-xs text-left px-3 py-2 rounded-lg bg-slate-50 hover:bg-blue-50 hover:text-blue-600 text-slate-500 transition border border-slate-100"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {msgs.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-blue-500 text-white rounded-br-sm'
                    : 'bg-slate-100 text-slate-800 rounded-bl-sm'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-slate-100 rounded-2xl rounded-bl-sm px-3 py-2 flex items-center gap-1.5">
                  <Loader2 size={13} className="animate-spin text-slate-400" />
                  <span className="text-xs text-slate-400">Antwortet...</span>
                </div>
              </div>
            )}

            {error && (
              <div className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-3 pb-3 pt-2 border-t border-slate-100 flex-shrink-0">
            <div className="flex gap-2 items-end">
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
                placeholder="Nachricht eingeben..."
                disabled={loading}
                className="flex-1 text-sm px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50 bg-slate-50 resize-none"
              />
              <button
                onClick={send}
                disabled={loading || !input.trim()}
                className="w-9 h-9 flex-shrink-0 flex items-center justify-center bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-40 transition"
              >
                <Send size={15} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
