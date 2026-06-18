import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Award, Clock } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

const progressData = [
  { day: 'Mo', progress: 65 },
  { day: 'Di', progress: 72 },
  { day: 'Mi', progress: 68 },
  { day: 'Do', progress: 78 },
  { day: 'Fr', progress: 85 },
  { day: 'Sa', progress: 82 },
  { day: 'So', progress: 90 },
];

const subjectScores = [85, 78, 72, 88, 81];

export default function Dashboard() {
  const { t } = useLanguage();

  const subjectData = t.dash_subjects.map((subject, i) => ({
    subject,
    score: subjectScores[i],
  }));

  return (
    <div className="flex-1 overflow-auto p-8 bg-slate-50 dark:bg-slate-900">
      <div className="max-w-6xl">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">{t.dash_title}</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2">{t.dash_subtitle}</p>
        </div>

        {/* Stats — Swiss grading: 1–6, 6 = best */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 dark:text-slate-400 text-sm">{t.dash_total_progress}</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-2">78%</p>
              </div>
              <TrendingUp className="text-blue-500" size={32} />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 dark:text-slate-400 text-sm">{t.dash_avg_grade}</p>
                {/* Swiss scale: 1–6, 6 = beste Note */}
                <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-2">5.2</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Ø /6</p>
              </div>
              <Award className="text-green-500" size={32} />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 dark:text-slate-400 text-sm">{t.dash_study_hours}</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-2">12.5h</p>
              </div>
              <Clock className="text-purple-500" size={32} />
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">{t.dash_weekly_chart}</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="day" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#f1f5f9' }} />
                <Line type="monotone" dataKey="progress" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">{t.dash_subject_chart}</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={subjectData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="subject" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis stroke="#94a3b8" domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#f1f5f9' }} />
                <Bar dataKey="score" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 mt-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">{t.dash_recent}</h3>
          <div className="space-y-3">
            {t.dash_activities.map((activity, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700 rounded">
                <span className="text-green-500 font-bold text-lg">✓</span>
                <div className="flex-1">
                  <p className="text-slate-900 dark:text-slate-100 font-medium">{activity.action}</p>
                </div>
                <span className="text-slate-400 dark:text-slate-500 text-sm">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
