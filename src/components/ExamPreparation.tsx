import { useState, useEffect, useRef } from 'react';
import { BookOpen, Plus, Trash2, CheckCircle, Clock, Pencil, ChevronLeft } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

interface Goal {
  id: string;
  text: string;
  done: boolean;
}

interface Topic {
  id: string;
  name: string;
  progress: number;
  completed: boolean;
  dueDate: string;
  goals: Goal[];
}

const DEFAULT_TOPICS: Topic[] = [];

function getUsername() { return localStorage.getItem('username') ?? ''; }

export default function ExamPreparation() {
  const { t } = useLanguage();
  const [topics, setTopics] = useState<Topic[]>(() => {
    try {
      const raw = localStorage.getItem(`notepilot-topics-${getUsername()}`);
      if (raw) {
        const p = JSON.parse(raw) as Topic[];
        if (Array.isArray(p) && p.length > 0)
          return p.map(t => ({ ...t, goals: t.goals ?? [] }));
      }
    } catch { /* ignore */ }
    return DEFAULT_TOPICS;
  });
  const [newTopic, setNewTopic] = useState('');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [openTopicId, setOpenTopicId] = useState<string | null>(null);
  const [newGoal, setNewGoal] = useState('');
  const renameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem(`notepilot-topics-${getUsername()}`, JSON.stringify(topics));
  }, [topics]);

  const commitRename = (id: string) => {
    const name = renameValue.trim();
    if (name) setTopics(prev => prev.map(t => t.id === id ? { ...t, name } : t));
    setRenamingId(null);
  };

  const addTopic = () => {
    if (!newTopic.trim()) return;
    setTopics(prev => [...prev, {
      id: Date.now().toString(), name: newTopic, progress: 0, completed: false,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      goals: [],
    }]);
    setNewTopic('');
  };

  const toggleTopic = (id: string) =>
    setTopics(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));

  const deleteTopic = (id: string) =>
    setTopics(prev => prev.filter(t => t.id !== id));

  // Goals
  const addGoal = (topicId: string) => {
    if (!newGoal.trim()) return;
    setTopics(prev => prev.map(t => t.id !== topicId ? t : {
      ...t, goals: [...t.goals, { id: Date.now().toString(), text: newGoal.trim(), done: false }]
    }));
    setNewGoal('');
  };
  const toggleGoal = (topicId: string, goalId: string) => {
    setTopics(prev => prev.map(t => {
      if (t.id !== topicId) return t;
      const goals = t.goals.map(g => g.id === goalId ? { ...g, done: !g.done } : g);
      const progress = goals.length ? Math.round((goals.filter(g => g.done).length / goals.length) * 100) : t.progress;
      return { ...t, goals, progress };
    }));
  };
  const deleteGoal = (topicId: string, goalId: string) => {
    setTopics(prev => prev.map(t => {
      if (t.id !== topicId) return t;
      const goals = t.goals.filter(g => g.id !== goalId);
      const progress = goals.length ? Math.round((goals.filter(g => g.done).length / goals.length) * 100) : t.progress;
      return { ...t, goals, progress };
    }));
  };

  const completedCount = topics.filter(t => t.completed).length;
  const openTopic = topics.find(t => t.id === openTopicId);

  // ── Detail view ──
  if (openTopic) {
    const doneGoals = openTopic.goals.filter(g => g.done).length;
    return (
      <div className="flex-1 overflow-auto p-8 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-2xl">
          <button onClick={() => setOpenTopicId(null)}
            className="flex items-center gap-1.5 text-blue-500 hover:text-blue-600 mb-6 text-sm font-medium">
            <ChevronLeft size={18} /> Zurück zur Übersicht
          </button>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-6 mb-6">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{openTopic.name}</h2>
              <span className="text-sm text-slate-400 dark:text-slate-500 flex items-center gap-1">
                <Clock size={14} /> {new Date(openTopic.dueDate).toLocaleDateString('de-CH')}
              </span>
            </div>
            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1 mt-3">
              <span>Fortschritt</span>
              <span>{openTopic.progress}%</span>
            </div>
            {openTopic.goals.length > 0 ? (
              <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2">
                <div className={`h-2 rounded-full transition-all ${openTopic.completed ? 'bg-green-500' : 'bg-blue-500'}`}
                  style={{ width: `${openTopic.progress}%` }} />
              </div>
            ) : (
              <input type="range" min={0} max={100} value={openTopic.progress}
                onChange={e => setTopics(prev => prev.map(t => t.id !== openTopic.id ? t : { ...t, progress: Number(e.target.value) }))}
                className="w-full accent-blue-500" />
            )}
            {openTopic.goals.length > 0 && (
              <p className="text-xs text-slate-400 mt-2">{doneGoals} von {openTopic.goals.length} Lernzielen erledigt</p>
            )}
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Lernziele</h3>

            <div className="flex gap-2 mb-5">
              <input
                type="text" value={newGoal} onChange={e => setNewGoal(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addGoal(openTopic.id)}
                placeholder="Neues Lernziel hinzufügen..."
                className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 text-sm"
              />
              <button onClick={() => addGoal(openTopic.id)}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm">
                <Plus size={16} /> Hinzufügen
              </button>
            </div>

            {openTopic.goals.length === 0 ? (
              <p className="text-slate-400 dark:text-slate-500 text-sm text-center py-6">
                Noch keine Lernziele — füge welche hinzu!
              </p>
            ) : (
              <div className="space-y-2">
                {openTopic.goals.map(goal => (
                  <div key={goal.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition ${
                      goal.done ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                               : 'bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600'
                    }`}>
                    <button onClick={() => toggleGoal(openTopic.id, goal.id)}
                      className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition ${
                        goal.done ? 'bg-green-500 border-green-500' : 'border-slate-300 dark:border-slate-500 hover:border-green-500'
                      }`}>
                      {goal.done && <CheckCircle size={14} className="text-white" />}
                    </button>
                    <span className={`flex-1 text-sm ${goal.done ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'}`}>
                      {goal.text}
                    </span>
                    <button onClick={() => deleteGoal(openTopic.id, goal.id)}
                      className="text-slate-300 hover:text-red-500 transition">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── List view ──
  return (
    <div className="flex-1 overflow-auto p-8 bg-slate-50 dark:bg-slate-900">
      <div className="max-w-4xl">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">{t.exam_title}</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2">{t.exam_subtitle}</p>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow p-6 text-white mb-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="opacity-90">{t.exam_completion}</p>
              <p className="text-4xl font-bold mt-2">{Math.round((completedCount / topics.length) * 100)}%</p>
              <p className="text-sm opacity-75 mt-1">{completedCount} {t.exam_of} {topics.length} {t.exam_topics_done}</p>
            </div>
            <BookOpen size={64} className="opacity-30" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 mb-6">
          <div className="flex gap-2">
            <input type="text" value={newTopic} onChange={e => setNewTopic(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addTopic()}
              placeholder={t.exam_add_placeholder}
              className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
            />
            <button onClick={addTopic}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
              <Plus size={20} /> {t.exam_add_button}
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {topics.map(topic => (
            <div key={topic.id}
              className={`bg-white dark:bg-slate-800 rounded-lg shadow p-4 hover:shadow-md transition border-l-4 cursor-pointer ${
                topic.completed ? 'border-green-500' : 'border-blue-500'
              }`}
              onClick={() => setOpenTopicId(topic.id)}
            >
              <div className="flex items-center gap-4">
                <button onClick={e => { e.stopPropagation(); toggleTopic(topic.id); }}
                  className={`flex-shrink-0 w-6 h-6 rounded-full border-2 transition flex items-center justify-center ${
                    topic.completed ? 'bg-green-500 border-green-500' : 'border-slate-300 dark:border-slate-500 hover:border-green-500'
                  }`}>
                  {topic.completed && <CheckCircle size={20} className="text-white" />}
                </button>

                <div className="flex-1">
                  {renamingId === topic.id ? (
                    <input ref={renameRef} autoFocus value={renameValue}
                      onChange={e => setRenameValue(e.target.value)}
                      onBlur={() => commitRename(topic.id)}
                      onKeyDown={e => { if (e.key === 'Enter') commitRename(topic.id); if (e.key === 'Escape') setRenamingId(null); }}
                      onClick={e => e.stopPropagation()}
                      className="font-semibold text-slate-900 dark:text-slate-100 border border-blue-400 rounded px-2 py-0.5 outline-none bg-white dark:bg-slate-700 w-full"
                    />
                  ) : (
                    <div className="flex items-center gap-2 group/name">
                      <h3 className={`font-semibold ${topic.completed ? 'line-through text-slate-400' : 'text-slate-900 dark:text-slate-100'}`}>
                        {topic.name}
                      </h3>
                      {topic.goals.length > 0 && (
                        <span className="text-xs text-slate-400 dark:text-slate-500">
                          ({topic.goals.filter(g => g.done).length}/{topic.goals.length})
                        </span>
                      )}
                      <button onClick={e => { e.stopPropagation(); setRenamingId(topic.id); setRenameValue(topic.name); }}
                        className="opacity-0 group-hover/name:opacity-100 p-0.5 rounded text-slate-400 hover:text-blue-500 transition">
                        <Pencil size={13} />
                      </button>
                    </div>
                  )}
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex-1">
                      <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                        <span>{t.exam_progress}</span>
                        <span>{topic.progress}%</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2">
                        <div className={`h-2 rounded-full transition-all ${topic.completed ? 'bg-green-500' : 'bg-blue-500'}`}
                          style={{ width: `${topic.progress}%` }} />
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
                      <Clock size={16} />
                      {new Date(topic.dueDate).toLocaleDateString('de-CH')}
                    </div>
                  </div>
                </div>

                <button onClick={e => { e.stopPropagation(); deleteTopic(topic.id); }}
                  className="flex-shrink-0 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition">
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
