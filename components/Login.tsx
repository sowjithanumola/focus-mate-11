import React, { useState } from 'react';
import { BookOpenCheck, ArrowRight, Loader2, Mail, Lock, User as UserIcon, UserCheck, HelpCircle, AlertCircle } from 'lucide-react';
import { loginUser, signupUser, loginAsGuest } from '../services/storageService';
import { User } from '../types';

interface LoginProps {
  onLoginSuccess: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSignupSuggestion, setShowSignupSuggestion] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    if (!isLoginMode && !name) return;

    setLoading(true);
    setError(null);
    setShowSignupSuggestion(false);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    try {
      let user: User;
      if (isLoginMode) {
        user = loginUser(email, password);
      } else {
        user = signupUser(email, password, name);
      }
      onLoginSuccess(user);
    } catch (err: any) {
      const msg = err.message || "Authentication failed";
      setError(msg);
      
      // If user not found during login, suggest signup
      if (isLoginMode && (msg.includes("No account found") || msg.includes("Sign Up"))) {
        setShowSignupSuggestion(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGuestAuth = async () => {
    setLoading(true);
    setError(null);
    await new Promise(resolve => setTimeout(resolve, 600));
    const user = loginAsGuest();
    onLoginSuccess(user);
  };

  const switchToSignup = () => {
    setIsLoginMode(false);
    setShowSignupSuggestion(false);
    setError(null);
    // Keep email/password pre-filled
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md space-y-6 animate-slide-up">
        {/* Logo */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="p-3 bg-primary-600 rounded-2xl shadow-xl shadow-primary-500/20">
            <BookOpenCheck className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">FocusMate</h1>
          <p className="text-slate-500 max-w-xs">Your intelligent daily progress partner.</p>
        </div>

        {/* Auth Card */}
        <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
          
          {/* Header Toggle */}
          <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
            <button 
              onClick={() => { setIsLoginMode(true); setError(null); }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${isLoginMode ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Sign In
            </button>
            <button 
              onClick={() => { setIsLoginMode(false); setError(null); }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${!isLoginMode ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-xl text-center border border-red-100 flex flex-col items-center gap-2 animate-fade-in">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
                {showSignupSuggestion && (
                  <button 
                    type="button"
                    onClick={switchToSignup}
                    className="text-xs font-bold text-red-700 underline hover:text-red-800"
                  >
                    Create account for {email}?
                  </button>
                )}
              </div>
            )}

            {!isLoginMode && (
              <div className="space-y-1 animate-fade-in">
                <label className="text-xs font-semibold text-slate-500 ml-1">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    required={!isLoginMode}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    autoComplete="name"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 ml-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@example.com"
                  autoComplete="email"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete={isLoginMode ? "current-password" : "new-password"}
                  className="w-full pl-11 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? (
                    <HelpCircle className="w-5 h-5" /> 
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-slate-400 opacity-60"></div>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-primary-500/30 active:scale-[0.98] disabled:opacity-70 mt-2"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {isLoginMode ? 'Sign In' : 'Create Account'} <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-slate-400">or continue with</span>
            </div>
          </div>

          <button
            onClick={handleGuestAuth}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-[0.98] disabled:opacity-70"
          >
            <UserCheck className="w-5 h-5 text-slate-500" />
            <span className="text-sm">Guest Mode</span>
          </button>
        </div>
      </div>
    </div>
  );
};