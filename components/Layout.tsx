import React, { useState, useEffect } from 'react';
import { PenLine, BarChart2, History, BookOpenCheck, MessageCircleHeart, LogOut, User as UserIcon, Download } from 'lucide-react';
import { ViewState, User } from '../types';
import { logoutUser } from '../services/storageService';

interface LayoutProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
  user: User | null;
  onLogout: () => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ currentView, onNavigate, user, onLogout, children }) => {
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: any) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    
    // Show the install prompt
    installPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await installPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setInstallPrompt(null);
    }
  };

  const navItems = [
    { id: ViewState.DAILY_LOG, label: 'Log', icon: PenLine },
    { id: ViewState.ANALYTICS, label: 'Progress', icon: BarChart2 },
    { id: ViewState.AI_COACH, label: 'AI Coach', icon: MessageCircleHeart },
    { id: ViewState.HISTORY, label: 'History', icon: History },
  ];

  const handleLogout = () => {
    logoutUser();
    onLogout();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 px-4 py-3 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary-600">
            <BookOpenCheck className="w-6 h-6" />
            <h1 className="text-xl font-bold tracking-tight">FocusMate</h1>
          </div>
          
          <div className="flex items-center gap-3">
             {installPrompt && (
                <button
                  onClick={handleInstallClick}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 text-primary-600 rounded-lg text-xs font-semibold hover:bg-primary-100 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Install App
                </button>
             )}

             {user && (
               <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {user.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt={user.name} 
                        className="w-8 h-8 rounded-full border border-slate-100 object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold border border-primary-200">
                        {getInitials(user.name)}
                      </div>
                    )}
                    <span className="hidden sm:block text-sm text-slate-700 font-medium">
                      {user.name}
                    </span>
                  </div>
                  
                  <div className="h-6 w-px bg-slate-200 mx-1"></div>

                  <button 
                    onClick={handleLogout}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    title="Logout"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
               </div>
             )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-4xl mx-auto p-4 pb-24">
        {installPrompt && (
           <div className="sm:hidden mb-4 bg-primary-50 border border-primary-100 p-3 rounded-xl flex items-center justify-between">
             <div className="text-sm text-primary-800 font-medium">Install FocusMate for easier access</div>
             <button 
               onClick={handleInstallClick}
               className="px-3 py-1.5 bg-primary-600 text-white rounded-lg text-xs font-bold shadow-sm"
             >
               Install
             </button>
           </div>
        )}
        {children}
      </main>

      {/* Bottom Navigation (Mobile First) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 pb-safe-area z-20">
        <div className="max-w-4xl mx-auto flex justify-around items-center">
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex flex-col items-center justify-center w-full py-3 px-1 transition-colors duration-200 ${
                  isActive 
                    ? 'text-primary-600 bg-primary-50/50' 
                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                }`}
              >
                <item.icon className={`w-6 h-6 ${isActive ? 'fill-current' : ''} stroke-[1.5px]`} />
                <span className="text-[10px] font-medium mt-1">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};