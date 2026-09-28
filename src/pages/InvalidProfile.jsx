import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home, Search } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

export default function InvalidProfile() {
  const { memberId } = useParams();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-between p-4 sm:p-6 bg-grid-pattern relative overflow-hidden light:bg-slate-50 light:text-slate-900 transition-colors">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-red-600/10 rounded-full blur-[120px] pointer-events-none light:bg-red-400/15" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none light:bg-blue-400/15" />

      {/* Top Controls */}
      <div className="w-full max-w-md flex items-center justify-between z-10 pt-2">
        <Link 
          to="/" 
          className="flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors light:text-slate-600 light:hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to CSI KARE</span>
        </Link>
        <ThemeToggle />
      </div>

      {/* Center 404 Glass Card */}
      <div className="w-full max-w-md my-auto z-10">
        <div className="glass-card rounded-3xl p-8 sm:p-10 text-center shadow-2xl relative overflow-hidden border border-red-500/20 light:border-red-200">
          
          {/* Subtle Top Red Accent Line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-80" />

          {/* Icon Badge */}
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shadow-inner light:bg-red-50 light:text-red-500 light:border-red-200">
            <ShieldAlert className="w-10 h-10" />
          </div>

          {/* Titles & Message strictly following specifications */}
          <span className="inline-block text-[11px] font-mono uppercase tracking-widest px-3 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 mb-3 font-semibold light:bg-red-50 light:text-red-600">
            Error 404
          </span>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2 light:text-slate-900">
            PROFILE NOT FOUND
          </h1>

          <p className="text-slate-400 text-sm mb-6 light:text-slate-600">
            This member profile doesn't exist.
          </p>

          {memberId && (
            <div className="mb-6 p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs font-mono text-slate-300 light:bg-slate-100 light:border-slate-200 light:text-slate-700">
              Queried ID: <span className="text-red-400 font-bold">{memberId}</span>
            </div>
          )}

          {/* Action Button */}
          <Link
            to="/"
            className="w-full inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-blue-600/25 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <Home className="w-4 h-4" />
            <span>Back to CSI KARE</span>
          </Link>
        </div>
      </div>

      {/* Bottom Branding */}
      <div className="w-full max-w-md text-center text-xs text-slate-500 py-4 z-10 light:text-slate-400">
        <p className="font-semibold text-slate-400 light:text-slate-600">CSI KARE Student Chapter</p>
        <p className="text-[11px] mt-0.5">Core Team 2026–27</p>
      </div>
    </div>
  );
}
