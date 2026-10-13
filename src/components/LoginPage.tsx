import React, { useState } from 'react';
import { AuthUser } from '../types/auth';
import { loginUser, registerUser } from '../utils/auth';
import { 
  Lock, 
  Mail, 
  User, 
  Sparkles, 
  CalendarClock, 
  Bell, 
  TrendingUp, 
  Eye, 
  EyeOff, 
  ArrowRight
} from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (user: AuthUser) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [isRegister, setIsRegister] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    setTimeout(() => {
      if (isRegister) {
        if (!name.trim()) {
          setErrorMessage('Please enter your name.');
          setIsLoading(false);
          return;
        }
        const result = registerUser(name, email, password);
        if (result.success && result.user) {
          onLoginSuccess(result.user);
        } else {
          setErrorMessage(result.error || 'Failed to create account.');
        }
      } else {
        const result = loginUser(email, password);
        if (result.success && result.user) {
          onLoginSuccess(result.user);
        } else {
          setErrorMessage(result.error || 'Invalid email or password.');
        }
      }
      setIsLoading(false);
    }, 300);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between selection:bg-emerald-500/20 selection:text-emerald-300">
      {/* Top Bar */}
      <header className="w-full border-b border-neutral-900 bg-neutral-950/80 backdrop-blur-md py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold tracking-tight text-white">
              Stanlake Focus
            </span>
            <span className="text-neutral-600">·</span>
            <span className="text-xs text-neutral-400 font-medium">Deep Work Companion</span>
          </div>

          <div className="text-xs text-neutral-400 font-medium">
            Created by Stanlake T.Maderera
          </div>
        </div>
      </header>

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col lg:flex-row items-center justify-center gap-12">
        {/* Left Side: Product Value Propositions */}
        <div className="flex-1 space-y-6 text-left max-w-lg">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-800/80 text-emerald-400 text-xs font-mono">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Persistent Deep Work & Exam Tracker</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white text-balance leading-tight">
              Master your studies without losing momentum.
            </h1>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Sign in to protect your study streaks, sync your custom subjects, and keep high-stakes final exam countdowns ticking accurately across every session.
            </p>
          </div>

          {/* Feature checklist */}
          <div className="space-y-3.5 pt-2">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-emerald-400 shrink-0 mt-0.5">
                <CalendarClock className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-white">Uninterrupted Final Exam Countdowns</h4>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Exam deadlines keep counting down dynamically to the second, even when you are logged out or offline.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-amber-400 shrink-0 mt-0.5">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-white">Timely Study & Exam Notifications</h4>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Receive browser notifications when focus sprints finish, break time concludes, and exams approach.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-sky-400 shrink-0 mt-0.5">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-white">Continuous Profile & Analytics Sync</h4>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Your customized subjects, study streaks, XP, level progression, and badges are safely preserved.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Authentication Card */}
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
            {/* Form Toggle: Sign In vs Sign Up */}
            <div className="flex items-center p-1 bg-neutral-950 border border-neutral-800 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setIsRegister(false);
                  setErrorMessage(null);
                }}
                className={`flex-1 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                  !isRegister
                    ? 'bg-neutral-800 text-white shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsRegister(true);
                  setErrorMessage(null);
                }}
                className={`flex-1 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                  isRegister
                    ? 'bg-neutral-800 text-white shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Error Message Alert */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-xs text-rose-300 animate-fadeIn">
                {errorMessage}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegister && (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-neutral-300">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-3 text-neutral-500" />
                    <input
                      type="text"
                      placeholder="e.g. Teekay Maderera"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      required={isRegister}
                      className="w-full pl-10 pr-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-neutral-300">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3 text-neutral-500" />
                  <input
                    type="email"
                    placeholder="tk@gmail.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-neutral-300">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3 text-neutral-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full pl-10 pr-10 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 transition-colors font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => !prev)}
                    className="absolute right-3.5 top-3 text-neutral-500 hover:text-neutral-300 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-neutral-400 pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    className="rounded border-neutral-800 bg-neutral-950 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Remember me</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold tracking-wide transition-all shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{isLoading ? 'Authenticating...' : isRegister ? 'Create Scholar Account' : 'Sign In to Workspace'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-neutral-900 bg-neutral-950 py-4 text-center text-xs text-neutral-400">
        Created by Stanlake T.Maderera · Distraction-free Study Architecture
      </footer>
    </div>
  );
};
