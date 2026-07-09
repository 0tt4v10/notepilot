import { useState, useEffect, useRef } from 'react';
import { TrendingUp, BookOpen, Settings as SettingsIcon, MessageCircle, PenLine, LogOut, User, X, Shield, Info, Flame, Play, Pause, RotateCcw, Layers, Star } from 'lucide-react';
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

function getXp(username: string): number {
  return parseInt(localStorage.getItem(`notepilot-xp-${username}`) ?? '0');
}

function getStreak(username: string): number {
  const key = `notepilot-streak-${username}`;
  const today = new Date().toISOString().slice(0, 10);
  try {
    const raw = localStorage.getItem(key);
    const data = raw ? JSON.parse(raw) : { count: 0, lastDate: '' };
    if (data.lastDate === today) return data.count;
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const newCount = data.lastDate === yesterday ? data.count + 1 : 1;
    localStorage.setItem(key, JSON.stringify({ count: newCount, lastDate: today }));
    return newCount;
  } catch { return 1; }
}

const WORK_SEC = 25 * 60;
const BREAK_SEC = 5 * 60;

function fmt(s: number) {
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

export default function Sidebar({ currentPage, setCurrentPage, username, onLogout }: SidebarProps) {
  const { t } = useLanguage();
  const [showTech, setShowTech] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [streak] = useState(() => getStreak(username));
  const [xp, setXp] = useState(() => getXp(username));

  // Poll XP from localStorage so it updates after quiz
  useEffect(() => {
    const id = setInterval(() => setXp(getXp(username)), 2000);
    return () => clearInterval(id);
  }, [username]);

  const level = Math.floor(xp / 200) + 1;
  const xpInLevel = xp % 200;
  const xpProgress = (xpInLevel / 200) * 100;

  // Pomodoro
  const [timeLeft, setTimeLeft] = useState(WORK_SEC);
  const [running, setRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const isBreakRef = useRef(isBreak);
  isBreakRef.current = isBreak;

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setTimeLeft(t => t - 1);
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (timeLeft <= 0) {
      const next = !isBreakRef.current;
      setIsBreak(next);
      setTimeLeft(next ? BREAK_SEC : WORK_SEC);
    }
  }, [timeLeft]);

  const resetTimer = () => {
    setRunning(false);
    setIsBreak(false);
    setTimeLeft(WORK_SEC);
  };

  const progress = isBreak
    ? ((BREAK_SEC - timeLeft) / BREAK_SEC) * 100
    : ((WORK_SEC - timeLeft) / WORK_SEC) * 100;

  const menuItems = [
    { id: 'notes', label: t.nav_notes, icon: PenLine },
    { id: 'dashboard', label: t.nav_dashboard, icon: TrendingUp },
    { id: 'exam', label: t.nav_exam, icon: BookOpen },
    { id: 'learn', label: 'Lernen', icon: Layers },
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

        {/* XP / Level */}
        <div className="mx-4 mb-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl px-4 py-3">
          <div className="flex items-center gap-2 mb-1.5">
            <Star size={15} className="text-yellow-500 flex-shrink-0" />
            <span className="text-sm font-bold text-yellow-600 dark:text-yellow-400">Level {level}</span>
            <span className="text-xs text-yellow-400 dark:text-yellow-500 ml-auto">{xpInLevel}/200 XP</span>
          </div>
          <div className="w-full bg-yellow-200 dark:bg-yellow-900/40 rounded-full h-1.5">
            <div className="h-1.5 rounded-full bg-yellow-400 transition-all" style={{ width: `${xpProgress}%` }} />
          </div>
        </div>

        {/* Streak */}
        <div className="mx-4 mb-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl px-4 py-3 flex items-center gap-3">
          <Flame size={20} className="text-orange-500 flex-shrink-0" />
          <div>
            <p className="text-sm font-bold text-orange-600 dark:text-orange-400">{streak} {streak === 1 ? 'Tag' : 'Tage'} Serie</p>
            <p className="text-xs text-orange-400 dark:text-orange-500">Jeden Tag weiterlernen!</p>
          </div>
        </div>

        {/* Pomodoro */}
        <div className="mx-4 mb-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide text-center mb-3">
            {isBreak ? '☕ Pause' : '🎯 Fokus'}
          </p>

          <div className="flex items-center gap-4">
            {/* Circular progress */}
            <div className="relative flex-shrink-0 w-16 h-16">
              <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="26" fill="none"
                  className="stroke-slate-200 dark:stroke-slate-600" strokeWidth="5" />
                <circle cx="32" cy="32" r="26" fill="none"
                  stroke={isBreak ? '#22c55e' : '#3b82f6'}
                  strokeWidth="5" strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 26}`}
                  strokeDashoffset={`${2 * Math.PI * 26 * (1 - progress / 100)}`}
                  style={{ transition: 'stroke-dashoffset 1s linear' }} />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-xs font-mono font-bold ${isBreak ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'}`}>
                  {fmt(timeLeft)}
                </span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex-1 space-y-2">
              <button onClick={() => setRunning(r => !r)}
                className={`w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition ${
                  running
                    ? 'bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-500'
                    : isBreak ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}>
                {running ? <Pause size={13} /> : <Play size={13} />}
                {running ? 'Pause' : 'Start'}
              </button>
              <button onClick={resetTimer}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition">
                <RotateCcw size={11} /> Reset
              </button>
            </div>
          </div>
        </div>

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
                <li>Cloud-Sync via Supabase für geräteübergreifenden Zugriff</li>
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
