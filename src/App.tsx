import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ExamPreparation from './components/ExamPreparation';
import Settings from './components/Settings';
import ChatAssistant from './components/ChatAssistant';
import NotesPage from './components/NotesPage';
import AiChatPopup from './components/AiChatPopup';
import './index.css';

type Page = 'notes' | 'dashboard' | 'exam' | 'settings' | 'chat';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('notes');

  const renderContent = () => {
    switch (currentPage) {
      case 'notes':
        return <NotesPage />;
      case 'dashboard':
        return <Dashboard />;
      case 'exam':
        return <ExamPreparation />;
      case 'settings':
        return <Settings />;
      case 'chat':
        return <ChatAssistant />;
      default:
        return <NotesPage />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <main className="flex-1 flex flex-col overflow-hidden">
        {renderContent()}
      </main>
      <AiChatPopup />
    </div>
  );
}

export default App;
