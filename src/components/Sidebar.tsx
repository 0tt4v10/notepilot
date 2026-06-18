import { TrendingUp, BookOpen, Settings as SettingsIcon, MessageCircle, PenLine } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

interface SidebarProps {
  currentPage: string;
  setCurrentPage: (page: any) => void;
}

export default function Sidebar({ currentPage, setCurrentPage }: SidebarProps) {
  const { t } = useLanguage();

  const menuItems = [
    { id: 'notes', label: t.nav_notes, icon: PenLine },
    { id: 'dashboard', label: t.nav_dashboard, icon: TrendingUp },
    { id: 'exam', label: t.nav_exam, icon: BookOpen },
    { id: 'chat', label: t.nav_chat, icon: MessageCircle },
    { id: 'settings', label: t.nav_settings, icon: SettingsIcon },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col shadow-sm">
      <div className="p-6 border-b border-slate-200 dark:border-slate-700">
        <h1 className="text-2xl font-bold text-blue-600">NotePilot</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Learning Assistant</p>
      </div>

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
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-200 dark:border-slate-700">
        <div className="text-xs text-slate-500 dark:text-slate-400 text-center">
          <p>NotePilot v1.0</p>
          <a
            href="https://github.com"
            className="inline-flex items-center gap-1 mt-1.5 px-2 py-1 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors text-xs font-medium"
            title="Browser-Extension für OneNote Web"
            onClick={e => e.preventDefault()}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
            </svg>
            Add-on
          </a>
        </div>
      </div>
    </aside>
  );
}
