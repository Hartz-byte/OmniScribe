import { useState } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { ChatWindow } from './components/chat/ChatWindow';
import { IngestionDashboard } from './components/ingestion/IngestionDashboard';
import { FeedbackModal } from './components/feedback/FeedbackModal';
import type { Message } from './types';

type ViewType = 'chat' | 'ingest';

function App() {
  const [activeView, setActiveView] = useState<ViewType>('chat');
  const [feedbackMessage, setFeedbackMessage] = useState<Message | null>(null);
  const [showToast, setShowToast] = useState(false);

  const handleFeedbackClick = (message: Message) => {
    setFeedbackMessage(message);
  };

  const handleFeedbackSuccess = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="flex h-screen bg-bg-primary">
      {/* Sidebar */}
      <Sidebar activeView={activeView} onViewChange={setActiveView} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {activeView === 'chat' && (
          <ChatWindow onFeedbackClick={handleFeedbackClick} />
        )}
        {activeView === 'ingest' && <IngestionDashboard />}
      </main>

      {/* Feedback Modal */}
      {feedbackMessage && (
        <FeedbackModal
          message={feedbackMessage}
          onClose={() => setFeedbackMessage(null)}
          onSuccess={handleFeedbackSuccess}
        />
      )}

      {/* Success Toast */}
      {showToast && (
        <div className="fixed bottom-6 right-6 px-6 py-3 bg-success text-white rounded-xl shadow-lg animate-slide-up flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Memory updated! I've learned from your feedback.
        </div>
      )}
    </div>
  );
}

export default App;
