import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, LayoutDashboard, LogOut } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/80 border-b border-[#F4CCD5] transition-colors dark:bg-[#1A0308]/80 dark:border-[#580B1C]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo & Title */}
        <Link to="/" className="flex items-center space-x-3 group">
          <img 
            src="/logo.svg" 
            alt="CSI KARE" 
            className="w-10 h-10 object-contain drop-shadow-sm group-hover:scale-105 transition-transform shrink-0" 
          />
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-heading font-extrabold text-base tracking-tight text-[#580B1C] dark:text-[#FCE7EB] group-hover:text-[#701026] transition-colors">
                CSI KARE
              </span>
              <span className="text-[10px] uppercase font-heading font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#FFF5F7] text-[#701026] border border-[#F4CCD5] dark:bg-[#3B0511] dark:text-[#E8A5B3] dark:border-[#580B1C]">
                Core Team
              </span>
            </div>
            <p className="text-[11px] text-[#881832] dark:text-[#E8A5B3]/80 font-medium">
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
                className={`hidden sm:flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold font-heading transition-all border ${
                  isAdmin
                    ? 'bg-[#701026] text-white border-[#580B1C] shadow-sm'
                    : 'bg-[#FFF5F7] text-[#580B1C] border-[#F4CCD5] hover:bg-[#FCE7EB] dark:bg-[#2A040D] dark:text-[#FCE7EB] dark:border-[#580B1C]'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </Link>

              <button
                onClick={logout}
                title="Sign out of admin"
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition-all cursor-pointer dark:bg-red-950/40 dark:text-red-400 dark:border-red-900"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <Link
              to="/admin/login"
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold font-heading bg-[#FFF5F7] text-[#580B1C] hover:bg-[#FCE7EB] border border-[#F4CCD5] transition-all shadow-sm dark:bg-[#2A040D] dark:text-[#FCE7EB] dark:border-[#580B1C]"
            >
              <Shield className="w-3.5 h-3.5 text-[#701026] dark:text-[#E8A5B3]" />
              <span>Admin</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
