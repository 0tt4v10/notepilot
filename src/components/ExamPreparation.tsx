import { useState } from 'react';
import { BookOpen, Plus, Trash2, CheckCircle, Clock } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

interface Topic {
  id: string;
  name: string;
  progress: number;
  completed: boolean;
  dueDate: string;
}

export default function ExamPreparation() {
  const { t } = useLanguage();
  const [topics, setTopics] = useState<Topic[]>([
    { id: '1', name: 'Analytische Geometrie', progress: 65, completed: false, dueDate: '2026-05-20' },
    { id: '2', name: 'Integralrechnung', progress: 40, completed: false, dueDate: '2026-05-22' },
    { id: '3', name: 'Wahrscheinlichkeitstheorie', progress: 80, completed: true, dueDate: '2026-05-18' },
    { id: '4', name: 'Lineare Algebra', progress: 55, completed: false, dueDate: '2026-05-25' },
  ]);
  const [newTopic, setNewTopic] = useState('');

  const addTopic = () => {
    if (!newTopic.trim()) return;
    setTopics(prev => [...prev, {
      id: Date.now().toString(),
      name: newTopic,
      progress: 0,
      completed: false,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    }]);
    setNewTopic('');
  };

  const toggleTopic = (id: string) =>
    setTopics(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));

  const deleteTopic = (id: string) =>
    setTopics(prev => prev.filter(t => t.id !== id));

  const completedCount = topics.filter(t => t.completed).length;

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
              <p className="text-sm opacity-75 mt-1">
                {completedCount} {t.exam_of} {topics.length} {t.exam_topics_done}
              </p>
            </div>
            <BookOpen size={64} className="opacity-30" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={newTopic}
              onChange={e => setNewTopic(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && addTopic()}
              placeholder={t.exam_add_placeholder}
              className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
            />
            <button
              onClick={addTopic}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              <Plus size={20} />
              {t.exam_add_button}
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {topics.map(topic => (
            <div
              key={topic.id}
              className={`bg-white dark:bg-slate-800 rounded-lg shadow p-4 hover:shadow-md transition border-l-4 ${
                topic.completed ? 'border-green-500' : 'border-blue-500'
              }`}
            >
              <div className="flex items-center gap-4">
                <button
                  onClick={() => toggleTopic(topic.id)}
                  className={`flex-shrink-0 w-6 h-6 rounded-full border-2 transition flex items-center justify-center ${
                    topic.completed
                      ? 'bg-green-500 border-green-500'
                      : 'border-slate-300 dark:border-slate-500 hover:border-green-500'
                  }`}
                >
                  {topic.completed && <CheckCircle size={20} className="text-white" />}
                </button>

                <div className="flex-1">
                  <h3 className={`font-semibold ${topic.completed ? 'line-through text-slate-400' : 'text-slate-900 dark:text-slate-100'}`}>
                    {topic.name}
                  </h3>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex-1">
                      <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                        <span>{t.exam_progress}</span>
                        <span>{topic.progress}%</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${topic.completed ? 'bg-green-500' : 'bg-blue-500'}`}
                          style={{ width: `${topic.progress}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
                      <Clock size={16} />
                      {new Date(topic.dueDate).toLocaleDateString('de-CH')}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => deleteTopic(topic.id)}
                  className="flex-shrink-0 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition"
                >
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
