import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ExamPreparation from './components/ExamPreparation';
import Settings from './components/Settings';
import ChatAssistant from './components/ChatAssistant';
import NotesPage from './components/NotesPage';
import AiChatPopup from './components/AiChatPopup';
import { LanguageContext } from './LanguageContext';
import { Language, translations } from './i18n';
import './index.css';

type Page = 'notes' | 'dashboard' | 'exam' | 'settings' | 'chat';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('notes');
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
  const [language, setLanguage] = useState<Language>(
    () => (localStorage.getItem('language') as Language) || 'de'
  );

  useEffect(() => {
    localStorage.setItem('darkMode', String(darkMode));
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const renderContent = () => {
    switch (currentPage) {
      case 'notes':
        return <NotesPage />;
      case 'dashboard':
        return <Dashboard />;
      case 'exam':
        return <ExamPreparation />;
      case 'settings':
        return (
          <Settings
            darkMode={darkMode}
            onToggleDarkMode={() => setDarkMode(d => !d)}
            language={language}
            onLanguageChange={setLanguage}
          />
        );
      case 'chat':
        return <ChatAssistant />;
      default:
        return <NotesPage />;
    }
  };

  return (
    <LanguageContext.Provider value={{ lang: language, t: translations[language] }}>
      <div className={`flex h-screen bg-slate-50 dark:bg-slate-900 ${darkMode ? 'dark' : ''}`}>
        <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
        <main className="flex-1 flex flex-col overflow-hidden">
          {renderContent()}
        </main>
        <AiChatPopup />
      </div>
    </LanguageContext.Provider>
  );
}

export default App;
