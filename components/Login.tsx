import React, { useState } from 'react';
import { BookOpenCheck, ArrowRight, Loader2, Mail, Lock, User as UserIcon, UserCheck, HelpCircle, AlertCircle } from 'lucide-react';
import { loginUser, signupUser, loginWithGoogle, loginAsGuest } from '../services/storageService';
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

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError(null);
    
    // Simulate Google Popup and Network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    try {
      const user = loginWithGoogle();
      onLoginSuccess(user);
    } catch (err: any) {
      setError("Google Sign-In failed. Please try again.");
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

          <div className="grid grid-cols-2 gap-3">
             {/* Google Button */}
            <button
              onClick={handleGoogleAuth}
              disabled={loading}
              className="flex items-center justify-center gap-2 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-[0.98] disabled:opacity-70"
            >
               <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                <span className="text-sm">Google</span>
            </button>

            {/* Guest Button */}
            <button
              onClick={handleGuestAuth}
              disabled={loading}
              className="flex items-center justify-center gap-2 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-[0.98] disabled:opacity-70"
            >
              <UserCheck className="w-5 h-5 text-slate-500" />
              <span className="text-sm">Guest</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};