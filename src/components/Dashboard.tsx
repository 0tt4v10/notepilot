import React, { useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Award, Clock } from 'lucide-react';

export default function Dashboard() {
  const [timeRange, setTimeRange] = useState('week');

  const progressData = [
    { day: 'Mo', progress: 65 },
    { day: 'Di', progress: 72 },
    { day: 'Mi', progress: 68 },
    { day: 'Do', progress: 78 },
    { day: 'Fr', progress: 85 },
    { day: 'Sa', progress: 82 },
    { day: 'So', progress: 90 },
  ];

  const subjectData = [
    { subject: 'Mathematik', score: 85 },
    { subject: 'Physik', score: 78 },
    { subject: 'Chemie', score: 72 },
    { subject: 'Biologie', score: 88 },
    { subject: 'Geschichte', score: 81 },
  ];

  return (
    <div className="flex-1 overflow-auto p-8">
      <div className="max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900">Lernfortschritt</h2>
          <p className="text-slate-500 mt-2">Übersicht Ihrer Lernaktivität und Fortschritt</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm">Gesamtfortschritt</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">78%</p>
              </div>
              <TrendingUp className="text-blue-500" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm">Durchschnittliche Note</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">1,8</p>
              </div>
              <Award className="text-green-500" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm">Lernstunden diese Woche</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">12.5h</p>
              </div>
              <Clock className="text-purple-500" size={32} />
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-2 gap-6">
          {/* Progress Line Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Wöchentlicher Fortschritt</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="day" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0' }}
                  cursor={{ stroke: '#3b82f6' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="progress" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Subject Performance Bar Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Leistung nach Fach</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={subjectData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="subject" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0' }}
                />
                <Bar dataKey="score" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Aktuelle Aktivitäten</h3>
          <div className="space-y-3">
            {[
              { action: 'Kapitel 5 abgeschlossen', time: 'vor 2 Stunden', icon: '✓' },
              { action: 'Quiz bestanden: Mathematik', time: 'vor 4 Stunden', icon: '✓' },
              { action: 'Zusammenfassung erstellt', time: 'gestern', icon: '✓' },
            ].map((activity, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded">
                <span className="text-green-500 font-bold text-lg">{activity.icon}</span>
                <div className="flex-1">
                  <p className="text-slate-900 font-medium">{activity.action}</p>
                </div>
                <span className="text-slate-400 text-sm">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
