import React, { useState } from 'react';
import { FileText, LogIn, LogOut, Plus, Sync, BookOpen } from 'lucide-react';

interface Notebook {
  id: string;
  name: string;
  lastSync: string;
}

export default function OneNoteIntegration() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [notebooks, setNotebooks] = useState<Notebook[]>([
    { id: '1', name: 'Mathematik', lastSync: '2026-05-07 10:30' },
    { id: '2', name: 'Physik', lastSync: '2026-05-06 14:15' },
    { id: '3', name: 'Chemie', lastSync: '2026-05-05 09:45' },
  ]);
  const [userEmail, setUserEmail] = useState('');
  const [newNotebook, setNewNotebook] = useState('');

  const handleMicrosoftLogin = () => {
    // Simulate Microsoft Graph OAuth flow
    setIsAuthenticated(true);
    setUserEmail('user@outlook.com');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserEmail('');
    setNotebooks([]);
  };

  const handleSyncNotebooks = () => {
    alert('Syncing with OneNote...');
  };

  const handleAddNotebook = () => {
    if (newNotebook.trim()) {
      setNotebooks([
        ...notebooks,
        {
          id: Date.now().toString(),
          name: newNotebook,
          lastSync: new Date().toLocaleString('de-DE'),
        },
      ]);
      setNewNotebook('');
    }
  };

  return (
    <div className="flex-1 overflow-auto p-8">
      <div className="max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900">OneNote Integration</h2>
          <p className="text-slate-500 mt-2">Verbinden Sie Ihre OneNote-Notizbücher mit NotePilot</p>
        </div>

        {!isAuthenticated ? (
          // Login Section
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-12 text-white mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold mb-3">Mit Microsoft OneNote verbinden</h3>
                <p className="text-blue-100 text-lg mb-6">
                  Authentifizieren Sie sich mit Ihrem Microsoft-Konto, um Ihre OneNote-Notizbücher mit NotePilot zu synchronisieren.
                </p>
                <button
                  onClick={handleMicrosoftLogin}
                  className="flex items-center gap-3 px-8 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition font-semibold text-lg"
                >
                  <LogIn size={24} />
                  Mit Microsoft anmelden
                </button>
              </div>
              <BookOpen size={120} className="opacity-20" />
            </div>
          </div>
        ) : (
          // Authenticated Section
          <>
            {/* User Info */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-sm">Angemeldet als:</p>
                  <p className="text-xl font-semibold text-slate-900">{userEmail}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                >
                  <LogOut size={20} />
                  Abmelden
                </button>
              </div>
            </div>

            {/* Sync Button */}
            <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-6 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-slate-900 mb-1">Synchronisieren</h4>
                  <p className="text-slate-600 text-sm">Aktualisieren Sie Ihre Notizbücher von OneNote</p>
                </div>
                <button
                  onClick={handleSyncNotebooks}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                >
                  <Sync size={20} />
                  Synchronisieren
                </button>
              </div>
            </div>

            {/* Add Notebook Form */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Notizbuch hinzufügen</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newNotebook}
                  onChange={(e) => setNewNotebook(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddNotebook()}
                  placeholder="Name des neuen Notizbuchs..."
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleAddNotebook}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                >
                  <Plus size={20} />
                  Hinzufügen
                </button>
              </div>
            </div>

            {/* Notebooks List */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Ihre Notizbücher</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {notebooks.map((notebook) => (
                  <div key={notebook.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-3">
                        <FileText className="text-blue-500 flex-shrink-0 mt-1" size={24} />
                        <div>
                          <h4 className="font-semibold text-slate-900">{notebook.name}</h4>
                          <p className="text-xs text-slate-500 mt-1">
                            Letzter Sync: {notebook.lastSync}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <button className="w-full px-4 py-2 border border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50 transition text-sm font-medium">
                        Öffnen
                      </button>
                      <button className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm font-medium">
                        Mit NotePilot synchronisieren
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Integration Info */}
            <div className="bg-slate-100 rounded-lg p-6 mt-8">
              <h4 className="font-semibold text-slate-900 mb-3">Was NotePilot für Sie tut:</h4>
              <ul className="space-y-2 text-slate-700 text-sm">
                <li>✓ Automatische Zusammenfassungen Ihrer OneNote-Notizen</li>
                <li>✓ Intelligente Lernforschritte basierend auf Ihren Notizen</li>
                <li>✓ Prüfungsvorbereitung aus Ihren Notizbüchern</li>
                <li>✓ KI-Assistent mit Kontext aus Ihren Notizen</li>
                <li>✓ Automatische Synchronisierung mit OneNote</li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
