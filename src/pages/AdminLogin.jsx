import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Lock, Mail, ArrowLeft, Loader2, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { isFirebaseConfigured } from '../config/firebase';
import ThemeToggle from '../components/ThemeToggle';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/admin');
    } catch (err) {
      setError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-6 bg-grid-pattern relative overflow-hidden light:bg-slate-50 light:text-slate-900 transition-colors">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-600/15 rounded-full blur-[120px] pointer-events-none light:bg-blue-400/20" />

      {/* Top Header */}
      <div className="w-full max-w-md mx-auto flex items-center justify-between z-10 pt-2">
        <Link 
          to="/" 
          className="flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors light:text-slate-600 light:hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to CSI KARE</span>
        </Link>
        <ThemeToggle />
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md mx-auto my-auto z-10">
        <div className="glass-card rounded-3xl p-8 sm:p-10 shadow-2xl border border-slate-800/80 light:border-slate-200">
          
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
              <KeyRound className="w-8 h-8" />
            </div>
            
            <h1 className="text-2xl font-bold text-white light:text-slate-900 tracking-tight">
              Admin Authentication
            </h1>
            <p className="text-xs text-slate-400 light:text-slate-500 mt-1">
              CSI KARE Core Team 2026–27 Portal
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium light:bg-red-50 light:text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 light:text-slate-700">
                Admin Email
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@csikare.org"
                  required
                  className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 light:bg-white light:border-slate-300 light:text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 light:text-slate-700">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 light:bg-white light:border-slate-300 light:text-slate-900"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center space-x-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-semibold shadow-lg shadow-blue-600/30 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Sign In to Dashboard</span>
              )}
            </button>
          </form>

          {!isFirebaseConfigured && (
            <div className="mt-6 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-[11px] text-blue-300 light:bg-blue-50 light:text-blue-800">
              <span className="font-bold">Dev Mode:</span> Firebase credentials not detected in <code className="font-mono bg-blue-950/50 px-1 rounded">.env</code>. You can sign in with any test email and password to explore the admin panel.
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="w-full max-w-md mx-auto text-center text-xs text-slate-500 py-2 light:text-slate-400">
        CSI KARE Student Chapter • Secure Administration
      </div>
    </div>
  );
}
