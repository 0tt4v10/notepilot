import React, { useState } from 'react';
import { Settings as SettingsIcon, Bell, Moon, Volume2, Save, Key, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { getApiKey, saveApiKey } from '../services/aiService';

interface Settings {
  notifications: boolean;
  darkMode: boolean;
  soundEnabled: boolean;
  language: string;
  emailAlerts: boolean;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    notifications: true,
    darkMode: false,
    soundEnabled: true,
    language: 'de',
    emailAlerts: true,
  });

  const [saved, setSaved] = useState(false);
  const [apiKey, setApiKey] = useState(getApiKey);
  const [showKey, setShowKey] = useState(false);
  const [keySaved, setKeySaved] = useState(false);

  const handleSaveApiKey = () => {
    saveApiKey(apiKey.trim());
    setKeySaved(true);
    setTimeout(() => setKeySaved(false), 2000);
  };

  const handleToggle = (key: keyof Settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    setSaved(false);
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSettings(prev => ({ ...prev, language: e.target.value }));
    setSaved(false);
  };

  const saveSettings = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex-1 overflow-auto p-8">
      <div className="max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900">Einstellungen</h2>
          <p className="text-slate-500 mt-2">Personalisieren Sie Ihr NotePilot Erlebnis</p>
        </div>

        {/* Settings Sections */}
        <div className="space-y-6">
          {/* Claude API Key */}
          <div className="bg-white rounded-lg shadow p-6 border-2 border-blue-100">
            <div className="flex items-center gap-3 mb-4">
              <Key className="text-blue-500" size={24} />
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Claude API-Schlüssel</h3>
                <p className="text-sm text-slate-500">Benötigt für den KI-Assistenten in den Notizen</p>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  placeholder="sk-ant-..."
                  className="w-full px-4 py-2 pr-10 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                />
                <button
                  onClick={() => setShowKey(v => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <button
                onClick={handleSaveApiKey}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium text-sm"
              >
                {keySaved ? <CheckCircle size={16} /> : <Save size={16} />}
                {keySaved ? 'Gespeichert!' : 'Speichern'}
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Der Schlüssel wird nur lokal in deinem Browser gespeichert.
            </p>
          </div>

          {/* Notifications Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-4">
              <Bell className="text-blue-500" size={24} />
              <h3 className="text-lg font-semibold text-slate-900">Benachrichtigungen</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
                <div>
                  <p className="font-medium text-slate-900">Lernbenachrichtigungen</p>
                  <p className="text-sm text-slate-500">Erhalten Sie Benachrichtigungen zu Ihren Lernaktivitäten</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications}
                    onChange={() => handleToggle('notifications')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
                <div>
                  <p className="font-medium text-slate-900">E-Mail-Benachrichtigungen</p>
                  <p className="text-sm text-slate-500">Wichtige Updates per E-Mail erhalten</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.emailAlerts}
                    onChange={() => handleToggle('emailAlerts')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Display Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-4">
              <Moon className="text-purple-500" size={24} />
              <h3 className="text-lg font-semibold text-slate-900">Anzeige</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
                <div>
                  <p className="font-medium text-slate-900">Dunkler Modus</p>
                  <p className="text-sm text-slate-500">Verwenden Sie ein dunkles Theme für bessere Sichtbarkeit</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.darkMode}
                    onChange={() => handleToggle('darkMode')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Audio Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-4">
              <Volume2 className="text-green-500" size={24} />
              <h3 className="text-lg font-semibold text-slate-900">Audio</h3>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
              <div>
                <p className="font-medium text-slate-900">Soundeffekte</p>
                <p className="text-sm text-slate-500">Aktivieren Sie Soundeffekte für Benachrichtigungen</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.soundEnabled}
                  onChange={() => handleToggle('soundEnabled')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
              </label>
            </div>
          </div>

          {/* Language Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-4">
              <SettingsIcon className="text-orange-500" size={24} />
              <h3 className="text-lg font-semibold text-slate-900">Sprache</h3>
            </div>

            <div className="p-3 bg-slate-50 rounded">
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Bevorzugte Sprache
              </label>
              <select
                value={settings.language}
                onChange={handleLanguageChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="de">Deutsch</option>
                <option value="en">English</option>
                <option value="fr">Français</option>
                <option value="es">Español</option>
              </select>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex gap-3">
            <button
              onClick={saveSettings}
              className="flex items-center gap-2 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium"
            >
              <Save size={20} />
              Speichern
            </button>
            {saved && (
              <div className="flex items-center gap-2 text-green-600 text-sm">
                ✓ Einstellungen gespeichert
              </div>
            )}
          </div>
        </div>

        {/* About Section */}
        <div className="bg-slate-100 rounded-lg p-6 mt-8">
          <h3 className="font-semibold text-slate-900 mb-2">Über NotePilot</h3>
          <p className="text-slate-600 text-sm">
            NotePilot v1.0 - Ein intelligenter Lernassistent für OneNote
          </p>
          <p className="text-slate-500 text-xs mt-2">© 2026 NotePilot. Alle Rechte vorbehalten.</p>
        </div>
      </div>
    </div>
  );
}
