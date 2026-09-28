import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, Sparkles, LogIn, LayoutDashboard, LogOut } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-slate-950/70 border-b border-slate-800/80 transition-colors dark:bg-slate-950/70 light:bg-white/80 light:border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Title */}
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 p-[2px] shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center light:bg-white">
              <span className="font-mono font-bold text-sm text-blue-400 light:text-blue-600">CSI</span>
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-base tracking-tight text-white light:text-slate-900 group-hover:text-blue-400 light:group-hover:text-blue-600 transition-colors">
                CSI KARE
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 light:bg-blue-50 light:text-blue-700 light:border-blue-200">
                Core Team
              </span>
            </div>
            <p className="text-[11px] text-slate-400 light:text-slate-500 font-medium">
              Student Chapter 2026–27
            </p>
          </div>
        </Link>

        {/* Right Actions */}
        <div className="flex items-center space-x-3">
          <ThemeToggle />

          {isAuthenticated ? (
            <div className="flex items-center space-x-2">
              <Link
                to="/admin"
                className={`hidden sm:flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                  isAdmin
                    ? 'bg-blue-600 text-white border-blue-500 shadow-sm shadow-blue-500/30'
                    : 'bg-slate-900/60 text-slate-300 border-slate-700 hover:bg-slate-800 light:bg-slate-100 light:text-slate-700 light:border-slate-300'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Admin Dashboard</span>
              </Link>

              <button
                onClick={logout}
                title="Sign out of admin"
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 hover:text-red-300 bg-red-950/30 hover:bg-red-950/60 border border-red-900/40 transition-all cursor-pointer light:bg-red-50 light:text-red-600 light:border-red-200 light:hover:bg-red-100"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <Link
              to="/admin/login"
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-900/80 text-slate-300 hover:text-white border border-slate-700/80 hover:border-blue-500/50 hover:bg-slate-800/90 transition-all shadow-sm light:bg-slate-100 light:text-slate-700 light:border-slate-300 light:hover:bg-slate-200"
            >
              <Shield className="w-3.5 h-3.5 text-blue-400 light:text-blue-600" />
              <span>Admin Login</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
