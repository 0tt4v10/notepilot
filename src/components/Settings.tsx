import React, { useState } from 'react';
import { Settings as SettingsIcon, Bell, Moon, Volume2, Save, Palette, Type } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { Language } from '../i18n';
import type { AccentColor, FontSize } from '../App';

interface SettingsState {
  notifications: boolean;
  soundEnabled: boolean;
  emailAlerts: boolean;
}

interface Props {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  accentColor: AccentColor;
  onAccentColorChange: (c: AccentColor) => void;
  fontSize: FontSize;
  onFontSizeChange: (s: FontSize) => void;
}

const LANGUAGES: { value: Language; label: string }[] = [
  { value: 'de', label: 'Deutsch' },
  { value: 'fr', label: 'Français' },
  { value: 'it', label: 'Italiano' },
  { value: 'en', label: 'English' },
];

const ACCENT_COLORS: { value: AccentColor; hex: string; label: string }[] = [
  { value: 'blue',   hex: '#3b82f6', label: 'Blau' },
  { value: 'purple', hex: '#8b5cf6', label: 'Lila' },
  { value: 'green',  hex: '#22c55e', label: 'Grün' },
  { value: 'orange', hex: '#f97316', label: 'Orange' },
  { value: 'rose',   hex: '#f43f5e', label: 'Rosa' },
];

const FONT_SIZES: { value: FontSize; label: string }[] = [
  { value: 'sm', label: 'Klein' },
  { value: 'md', label: 'Normal' },
  { value: 'lg', label: 'Gross' },
];

export default function SettingsPage({ darkMode, onToggleDarkMode, language, onLanguageChange, accentColor, onAccentColorChange, fontSize, onFontSizeChange }: Props) {
  const { t } = useLanguage();
  const [settings, setSettings] = useState<SettingsState>({
    notifications: true,
    soundEnabled: true,
    emailAlerts: true,
  });
  const [saved, setSaved] = useState(false);

  const handleToggle = (key: keyof SettingsState) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    setSaved(false);
  };

  const saveSettings = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex-1 overflow-auto p-8 bg-slate-50 dark:bg-slate-900">
      <div className="max-w-3xl">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">{t.set_title}</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2">{t.set_subtitle}</p>
        </div>

        <div className="space-y-6">
          {/* Notifications */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-4">
              <Bell className="text-blue-500" size={24} />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{t.set_notifications}</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded">
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-100">{t.set_notif_learn}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{t.set_notif_learn_desc}</p>
                </div>
                <Toggle checked={settings.notifications} onChange={() => handleToggle('notifications')} color="blue" />
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded">
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-100">{t.set_notif_email}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{t.set_notif_email_desc}</p>
                </div>
                <Toggle checked={settings.emailAlerts} onChange={() => handleToggle('emailAlerts')} color="blue" />
              </div>
            </div>
          </div>

          {/* Display */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-4">
              <Moon className="text-purple-500" size={24} />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{t.set_display}</h3>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded">
              <div>
                <p className="font-medium text-slate-900 dark:text-slate-100">{t.set_darkmode}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{t.set_darkmode_desc}</p>
              </div>
              <Toggle checked={darkMode} onChange={onToggleDarkMode} color="purple" />
            </div>
          </div>

          {/* Accent Color */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-4">
              <Palette className="text-pink-500" size={24} />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Akzentfarbe</h3>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded">
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-3">Farbe wählen</p>
              <div className="flex gap-3 flex-wrap">
                {ACCENT_COLORS.map(c => (
                  <button
                    key={c.value}
                    onClick={() => onAccentColorChange(c.value)}
                    title={c.label}
                    className={`w-10 h-10 rounded-full border-4 transition-transform hover:scale-110 ${
                      accentColor === c.value
                        ? 'border-slate-900 dark:border-white scale-110'
                        : 'border-transparent'
                    }`}
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Gewählt: {ACCENT_COLORS.find(c => c.value === accentColor)?.label}
              </p>
            </div>
          </div>

          {/* Font Size */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-4">
              <Type className="text-teal-500" size={24} />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Schriftgrösse</h3>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded">
              <div className="flex gap-2">
                {FONT_SIZES.map(s => (
                  <button
                    key={s.value}
                    onClick={() => onFontSizeChange(s.value)}
                    className={`flex-1 py-2 rounded-lg border-2 font-medium transition text-sm ${
                      fontSize === s.value
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                        : 'border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-blue-300'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Audio */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-4">
              <Volume2 className="text-green-500" size={24} />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{t.set_audio}</h3>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded">
              <div>
                <p className="font-medium text-slate-900 dark:text-slate-100">{t.set_sound}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{t.set_sound_desc}</p>
              </div>
              <Toggle checked={settings.soundEnabled} onChange={() => handleToggle('soundEnabled')} color="green" />
            </div>
          </div>

          {/* Language */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-4">
              <SettingsIcon className="text-orange-500" size={24} />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{t.set_language}</h3>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded">
              <label className="block text-sm font-medium text-slate-900 dark:text-slate-100 mb-2">
                {t.set_preferred_lang}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {LANGUAGES.map(l => (
                  <button
                    key={l.value}
                    onClick={() => onLanguageChange(l.value)}
                    className={`px-4 py-2 rounded-lg border-2 font-medium transition text-sm ${
                      language === l.value
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                        : 'border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-blue-300 dark:hover:border-blue-600'
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Save */}
          <div className="flex gap-3">
            <button
              onClick={saveSettings}
              className="flex items-center gap-2 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium"
            >
              <Save size={20} />
              {t.set_save}
            </button>
            {saved && (
              <div className="flex items-center gap-2 text-green-600 text-sm">{t.set_saved}</div>
            )}
          </div>
        </div>

        <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-6 mt-8">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">{t.set_about}</h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm">{t.set_about_desc}</p>
          <p className="text-slate-500 dark:text-slate-500 text-xs mt-2">© 2026 NotePilot.</p>
        </div>
      </div>
    </div>
  );
}

function Toggle({ checked, onChange, color }: { checked: boolean; onChange: () => void; color: 'blue' | 'purple' | 'green' }) {
  const colors = {
    blue: 'peer-focus:ring-blue-300 peer-checked:bg-blue-500',
    purple: 'peer-focus:ring-purple-300 peer-checked:bg-purple-500',
    green: 'peer-focus:ring-green-300 peer-checked:bg-green-500',
  };
  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input type="checkbox" checked={checked} onChange={onChange} className="sr-only peer" />
      <div className={`w-11 h-6 bg-slate-300 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-4 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${colors[color]}`} />
    </label>
  );
}
