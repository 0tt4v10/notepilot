import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageCircle, Loader, Trash2 } from 'lucide-react';
import { chat } from '../services/aiService';
import { useLanguage } from '../LanguageContext';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

const STORAGE_KEY = 'notepilot-chat-messages';

function loadMessages(welcomeText: string): Message[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as (Omit<Message, 'timestamp'> & { timestamp: string })[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(m => ({ ...m, timestamp: new Date(m.timestamp) }));
      }
    }
  } catch {
    // ignore corrupted storage
  }
  return [{ id: '1', text: welcomeText, sender: 'assistant', timestamp: new Date() }];
}

export default function ChatAssistant() {
  const { t } = useLanguage();
  const [messages, setMessages] = useState<Message[]>(() => loadMessages(t.chat_welcome));
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInputValue('');
    setIsLoading(true);
    setError('');

    try {
      const reply = await chat('', nextMessages.map(m => ({ role: m.sender, content: m.text })));
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: reply,
        sender: 'assistant',
        timestamp: new Date(),
      }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler bei der Anfrage.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 min-h-0 h-0">
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 shadow">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageCircle size={28} />
            <div>
              <h2 className="text-2xl font-bold">{t.chat_title}</h2>
              <p className="text-blue-100 text-sm">{t.chat_subtitle}</p>
            </div>
          </div>
          <button
            onClick={() => {
              const welcome = { id: '1', text: t.chat_welcome, sender: 'assistant' as const, timestamp: new Date() };
              setMessages([welcome]);
              localStorage.removeItem(STORAGE_KEY);
            }}
            title="Chat leeren"
            className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-4">
        {messages.map(message => (
          <div key={message.id} className={`flex gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            {message.sender === 'assistant' && (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <MessageCircle size={18} className="text-blue-600 dark:text-blue-300" />
              </div>
            )}
            <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
              message.sender === 'user'
                ? 'bg-blue-500 text-white rounded-br-none'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-bl-none'
            }`}>
              <p className="text-sm leading-relaxed">{message.text}</p>
              <p className={`text-xs mt-1 ${message.sender === 'user' ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'}`}>
                {message.timestamp.toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            {message.sender === 'user' && (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-300 dark:bg-slate-600 flex items-center justify-center">
                <span className="text-sm font-semibold text-white">Du</span>
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <Loader size={18} className="text-blue-600 dark:text-blue-300 animate-spin" />
            </div>
            <div className="bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100 px-4 py-3 rounded-lg rounded-bl-none">
              <p className="text-sm">{t.chat_typing}</p>
            </div>
          </div>
        )}

        {error && <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg px-4 py-3">{error}</div>}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-slate-200 dark:border-slate-700 p-6 bg-slate-50 dark:bg-slate-800">
        <form onSubmit={handleSendMessage} className="flex gap-3">
          <input
            type="text"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            placeholder={t.chat_placeholder}
            disabled={isLoading}
            className="flex-1 px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 dark:disabled:bg-slate-700 disabled:cursor-not-allowed bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
          />
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:bg-slate-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
          >
            <Send size={20} />
          </button>
        </form>

        <div className="mt-4">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{t.chat_example_questions}</p>
          <div className="grid grid-cols-2 gap-2">
            {t.chat_suggestions.map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => setInputValue(suggestion)}
                className="text-xs px-3 py-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded hover:bg-slate-100 dark:hover:bg-slate-600 transition text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
