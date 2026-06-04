import React from 'react';
import { TrendingUp, BookOpen, Settings as SettingsIcon, MessageCircle, PenLine } from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  setCurrentPage: (page: any) => void;
}

export default function Sidebar({ currentPage, setCurrentPage }: SidebarProps) {
  const menuItems = [
    { id: 'notes', label: 'Notizen', icon: PenLine },
    { id: 'dashboard', label: 'Lernfortschritt', icon: TrendingUp },
    { id: 'exam', label: 'Prüfungsvorbereitung', icon: BookOpen },
    { id: 'chat', label: 'KI Assistent', icon: MessageCircle },
    { id: 'settings', label: 'Einstellungen', icon: SettingsIcon },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-blue-600">NotePilot</h1>
        <p className="text-sm text-slate-500 mt-1">Learning Assistant</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-100 text-blue-700 font-medium'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200">
        <div className="text-xs text-slate-500 text-center">
          <p>NotePilot v1.0</p>
        </div>
      </div>
    </aside>
  );
}
