import { TrendingUp, BookOpen, Settings as SettingsIcon, MessageCircle, PenLine, LogOut, User } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

interface SidebarProps {
  currentPage: string;
  setCurrentPage: (page: any) => void;
  username: string;
  onLogout: () => void;
}

export default function Sidebar({ currentPage, setCurrentPage, username, onLogout }: SidebarProps) {
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

      <div className="p-4 border-t border-slate-200 dark:border-slate-700 space-y-3">
        {/* User info */}
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
            <User size={15} className="text-blue-600 dark:text-blue-300" />
          </div>
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate flex-1">{username}</span>
          <button
            onClick={onLogout}
            title="Abmelden"
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
          >
            <LogOut size={15} />
          </button>
        </div>

        <div className="text-xs text-slate-400 dark:text-slate-500 text-center">
          <p>NotePilot v1.0</p>
        </div>
      </div>
    </aside>
  );
}
