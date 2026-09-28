import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      type="button"
      aria-label="Toggle Theme"
      className={`p-2.5 rounded-full transition-all duration-200 border cursor-pointer ${
        theme === 'dark'
          ? 'bg-slate-900/80 border-slate-700/60 text-amber-400 hover:bg-slate-800 hover:border-amber-400/40 hover:shadow-[0_0_15px_rgba(251,191,36,0.2)]'
          : 'bg-white border-slate-200 text-indigo-600 hover:bg-slate-50 hover:border-indigo-300 hover:shadow-md'
      } ${className}`}
      title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {theme === 'dark' ? (
        <Sun className="w-4 h-4 transition-transform hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 transition-transform hover:-rotate-12" />
      )}
    </button>
  );
}
