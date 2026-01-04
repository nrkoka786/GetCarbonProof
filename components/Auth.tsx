
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { sendSignUpNotification, useAuth } from '../contexts/AuthContext';

const Logo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M50 5 L12 22 V50 C12 75 50 95 50 95 C50 95 88 75 88 50 V22 L50 5 Z" fill="#3730a3" />
    <path d="M38 65 C28 52 36 29 64 32 C74 47 56 75 38 65 Z" fill="#10b981" />
  </svg>
);

interface AuthProps {
  initialMode?: 'login' | 'signup';
  hasPendingData?: boolean;
  onBack?: () => void;
}

export const Auth: React.FC<AuthProps> = ({ initialMode = 'login', hasPendingData = false, onBack }) => {
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const { user: currentUser } = useAuth();

  useEffect(() => {
    setIsLogin(initialMode === 'login');
  }, [initialMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      let authResponse;
      if (isLogin) {
        authResponse = await supabase.auth.signInWithPassword({ email, password });
      } else {
        authResponse = await supabase.auth.signUp({ email, password });
        // Trigger EmailJS notification for new user registration
        if (authResponse.data?.user?.email) {
          await sendSignUpNotification(authResponse.data.user.email);
        }
      }

      if (authResponse.error) throw authResponse.error;

      // Persistence Sequence Detection
      if (hasPendingData) {
        setMessage({ 
          type: 'success', 
          text: isLogin 
            ? 'Auth Verified. Initializing Persistence Sequence: Syncing Guest Audit to Neural Ledger...' 
            : 'Account Initialized. Persistence Sequence Active: Migrating Guest Results...' 
        });
        // Note: The actual migration logic is handled by the App.tsx useEffect 
        // which triggers as soon as the session state changes.
      } else {
        setMessage({ 
          type: 'success', 
          text: isLogin ? 'Access Granted. Entering Hub...' : 'Account Created. Please verify your email.' 
        });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 relative">
      {onBack && (
        <button 
          onClick={onBack}
          className="absolute top-8 left-8 text-slate-400 hover:text-slate-900 font-bold flex items-center gap-2 transition-colors z-10"
        >
          <i className="fas fa-arrow-left"></i>
          Return to Hub
        </button>
      )}

      {/* Persistence Sequence Banner */}
      {hasPendingData && (
        <div className="mb-8 px-6 py-3 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center gap-4 animate-in fade-in slide-in-from-top-4 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm shadow-indigo-200 shadow-lg">
            <i className="fas fa-rotate animate-spin-slow"></i>
          </div>
          <div>
            <p className="text-[10px] font-black text-indigo-700 uppercase tracking-[0.2em]">Sequence Detected</p>
            <p className="text-xs font-bold text-slate-600">Pending Guest Results Ready for Permanent Ledger Migration</p>
          </div>
        </div>
      )}

      <div className="w-full max-w-md bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500">
        <div className="bg-slate-900 p-12 flex flex-col items-center text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full"></div>
          <Logo className="h-20 w-20 mb-6 relative z-10" />
          <h2 className="text-white text-2xl font-black tracking-tight relative z-10">Lead Auditor Node</h2>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2 relative z-10">Secure Authentication Protocol</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-10 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Corporate Identity</label>
            <input 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none transition-all font-medium disabled:opacity-50 text-slate-900"
              placeholder="auditor@organization.com"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Security Key</label>
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none transition-all font-medium disabled:opacity-50 text-slate-900"
              placeholder="••••••••"
            />
          </div>

          {message && (
            <div className={`p-5 rounded-2xl text-xs font-bold leading-relaxed border animate-in fade-in slide-in-from-bottom-2 ${
              message.type === 'success' 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                : 'bg-rose-50 text-rose-700 border-rose-100'
            }`}>
              <div className="flex gap-3">
                <i className={`fas ${message.type === 'success' ? 'fa-circle-check' : 'fa-triangle-exclamation'} mt-0.5`}></i>
                <span>{message.text}</span>
              </div>
            </div>
          )}

          <button 
            type="submit"
            disabled={loading}
            className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-3 ${
              isLogin 
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-100' 
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-100'
            }`}
          >
            {loading ? (
              <div className="flex items-center gap-3">
                <i className="fas fa-circle-notch animate-spin"></i>
                <span>Finalizing Node...</span>
              </div>
            ) : (
              <>
                <i className={`fas ${isLogin ? (hasPendingData ? 'fa-rotate' : 'fa-right-to-bracket') : 'fa-user-shield'}`}></i>
                {isLogin ? (hasPendingData ? 'Authorize & Sync Ledger' : 'Access Control Node') : 'Initialize Auditor Account'}
              </>
            )}
          </button>

          <div className="text-center pt-2">
            <button 
              type="button"
              disabled={loading}
              onClick={() => {
                setIsLogin(!isLogin);
                setMessage(null);
              }}
              className="text-[10px] font-black text-slate-400 hover:text-indigo-600 uppercase tracking-widest transition-colors disabled:opacity-30"
            >
              {isLogin ? "New Auditor? Provision Access" : "Existing Auditor? Re-Authenticate"}
            </button>
          </div>
        </form>

        <div className="px-10 pb-10">
          <div className="flex items-center gap-4 opacity-20">
            <div className="h-px bg-slate-900 flex-1"></div>
            <i className="fas fa-fingerprint text-slate-900"></i>
            <div className="h-px bg-slate-900 flex-1"></div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
      `}</style>
    </div>
  );
};
