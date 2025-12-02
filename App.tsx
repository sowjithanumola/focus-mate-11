import React, { useState, useEffect } from 'react';
import { HashRouter } from 'react-router-dom';
import { Layout } from './components/Layout';
import { DailyLog } from './components/DailyLog';
import { Analytics } from './components/Analytics';
import { History } from './components/History';
import { Login } from './components/Login';
import { AICoach } from './components/AICoach';
import { ViewState, User } from './types';
import { getCurrentUser } from './services/storageService';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DAILY_LOG);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  useEffect(() => {
    const savedUser = getCurrentUser();
    if (savedUser) {
      setUser(savedUser);
    }
    setIsAuthChecking(false);
  }, []);

  const handleLoginSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
    setCurrentView(ViewState.DAILY_LOG);
  };

  const handleLogout = () => {
    setUser(null);
  };

  const renderView = () => {
    switch (currentView) {
      case ViewState.DAILY_LOG:
        return <DailyLog onEntrySaved={() => setCurrentView(ViewState.ANALYTICS)} />;
      case ViewState.ANALYTICS:
        return <Analytics />;
      case ViewState.HISTORY:
        return <History />;
      case ViewState.AI_COACH:
        return <AICoach />;
      default:
        return <DailyLog onEntrySaved={() => setCurrentView(ViewState.ANALYTICS)} />;
    }
  };

  if (isAuthChecking) return null;

  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <HashRouter>
      <Layout 
        currentView={currentView} 
        onNavigate={setCurrentView}
        user={user}
        onLogout={handleLogout}
      >
        {renderView()}
      </Layout>
    </HashRouter>
  );
};

export default App;