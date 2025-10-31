import React from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';
import VoiceAssistant from './VoiceAssistant';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();

  const handleVoiceNavigation = (path: string) => {
    navigate(path);
  };

  const handleVoiceAction = (action: string, data?: any) => {
    // Handle various voice actions
    switch (action) {
      case 'search':
        // Could trigger search functionality
        console.log('Voice search:', data);
        break;
      case 'help':
        // Show help modal or navigate to help page
        navigate('/help');
        break;
      default:
        console.log('Voice action:', action, data);
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-4">
          {children}
        </main>
        <Footer />
      </div>
      <VoiceAssistant onNavigate={handleVoiceNavigation} onAction={handleVoiceAction} />
    </div>
  );
};

export default Layout;