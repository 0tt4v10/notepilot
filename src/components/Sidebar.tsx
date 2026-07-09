import { useState } from 'react';
import { TrendingUp, BookOpen, Settings as SettingsIcon, MessageCircle, PenLine, LogOut, User, X, Shield, Info } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

interface SidebarProps {
  currentPage: string;
  setCurrentPage: (page: any) => void;
  username: string;
  onLogout: () => void;
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700">
          <h2 className="font-bold text-slate-900 dark:text-slate-100 text-lg">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition">
            <X size={20} />
          </button>
        </div>
        <div className="p-5 text-sm text-slate-700 dark:text-slate-300 space-y-4 leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function Sidebar({ currentPage, setCurrentPage, username, onLogout }: SidebarProps) {
  const { t } = useLanguage();
  const [showTech, setShowTech] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  const menuItems = [
    { id: 'notes', label: t.nav_notes, icon: PenLine },
    { id: 'dashboard', label: t.nav_dashboard, icon: TrendingUp },
    { id: 'exam', label: t.nav_exam, icon: BookOpen },
    { id: 'chat', label: t.nav_chat, icon: MessageCircle },
    { id: 'settings', label: t.nav_settings, icon: SettingsIcon },
  ];

  return (
    <>
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
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
              <User size={15} className="text-blue-600 dark:text-blue-300" />
            </div>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate flex-1">{username}</span>
            <button onClick={onLogout} title="Abmelden"
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition">
              <LogOut size={15} />
            </button>
          </div>

          <div className="flex items-center justify-center gap-3 text-xs text-slate-400 dark:text-slate-500">
            <button onClick={() => setShowTech(true)}
              className="flex items-center gap-1 hover:text-blue-500 transition">
              <Info size={11} /> Technische Info
            </button>
            <span>·</span>
            <button onClick={() => setShowPrivacy(true)}
              className="flex items-center gap-1 hover:text-blue-500 transition">
              <Shield size={11} /> Datenschutz
            </button>
          </div>

          <div className="text-xs text-slate-400 dark:text-slate-500 text-center">
            <p>NotePilot v1.0</p>
          </div>
        </div>
      </aside>

      {showTech && (
        <Modal title="Technische Info" onClose={() => setShowTech(false)}>
          <p className="text-slate-500 dark:text-slate-400 text-xs">Wie NotePilot aufgebaut ist</p>

          <div className="space-y-3">
            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-200 mb-1">Frontend</p>
              <ul className="space-y-0.5 text-slate-600 dark:text-slate-400">
                <li>React 18 mit TypeScript</li>
                <li>Tailwind CSS für das Design</li>
                <li>Vite als Build-Tool</li>
                <li>Recharts für Diagramme</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-200 mb-1">KI-Assistent</p>
              <ul className="space-y-0.5 text-slate-600 dark:text-slate-400">
                <li>Sprachmodell von Groq (llama-3.1)</li>
                <li>Anfragen laufen über einen sicheren Server — der API-Schlüssel ist nie im Browser sichtbar</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-200 mb-1">Datenspeicherung</p>
              <ul className="space-y-0.5 text-slate-600 dark:text-slate-400">
                <li>Alle Notizen bleiben lokal im Browser (localStorage)</li>
                <li>Kein eigener Server, keine Datenbank</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-200 mb-1">Hosting</p>
              <ul className="space-y-0.5 text-slate-600 dark:text-slate-400">
                <li>Vercel — automatisches Deployment via GitHub</li>
              </ul>
            </div>
          </div>
        </Modal>
      )}

      {showPrivacy && (
        <Modal title="Datenschutzerklärung" onClose={() => setShowPrivacy(false)}>
          <p className="text-slate-500 dark:text-slate-400 text-xs">Stand: Juli 2026</p>

          <div className="space-y-4">
            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-200 mb-1">Welche Daten werden gespeichert?</p>
              <p className="text-slate-600 dark:text-slate-400">Notizen, Einstellungen und Benutzername werden ausschliesslich lokal in deinem Browser gespeichert (localStorage). Es werden keine Daten an einen eigenen Server übertragen oder dort gespeichert.</p>
            </div>

            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-200 mb-1">KI-Assistent</p>
              <p className="text-slate-600 dark:text-slate-400">Wenn du den KI-Assistenten verwendest, werden deine Chat-Nachrichten und ein Auszug deiner Notizen an den KI-Dienst Groq (USA) übermittelt. Dies dient ausschliesslich zur Beantwortung deiner Anfrage. Groq verarbeitet diese Daten gemäss eigener Datenschutzrichtlinie.</p>
            </div>

            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-200 mb-1">Cookies & Tracking</p>
              <p className="text-slate-600 dark:text-slate-400">NotePilot verwendet keine Cookies und kein Tracking. Es werden keine Analysetools eingesetzt.</p>
            </div>

            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-200 mb-1">Daten löschen</p>
              <p className="text-slate-600 dark:text-slate-400">Alle lokalen Daten können jederzeit über die Browser-Einstellungen gelöscht werden (Websitedaten löschen).</p>
            </div>

            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-200 mb-1">Verantwortlich</p>
              <p className="text-slate-600 dark:text-slate-400">Dieses Projekt ist ein Schulprojekt ohne kommerzielle Absicht. Bei Fragen: schule.ottavio@gmail.com</p>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
