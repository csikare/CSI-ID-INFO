import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

export default function InvalidProfile() {
  const { memberId } = useParams();

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#3B0511] flex flex-col items-center justify-between p-4 sm:p-6 bg-maroon-pattern relative overflow-hidden dark:bg-[#150206] dark:text-[#FCE7EB] transition-colors">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#FCE7EB] rounded-full blur-[120px] pointer-events-none dark:bg-[#580B1C]/30" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-[#F8D0D8] rounded-full blur-[100px] pointer-events-none dark:bg-[#701026]/20" />

      {/* Top Controls */}
      <div className="w-full max-w-md flex items-center justify-between z-10 pt-2">
        <Link 
          to="/" 
          className="flex items-center space-x-2 text-xs font-semibold text-[#580B1C] hover:text-[#701026] transition-colors bg-white px-3.5 py-1.5 rounded-full border border-[#F4CCD5] shadow-sm dark:bg-[#2A040D] dark:border-[#580B1C] dark:text-[#FCE7EB]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="font-heading tracking-wide uppercase text-[11px]">Back to CSI KARE</span>
        </Link>
        <ThemeToggle />
      </div>

      {/* Center 404 Glass Card */}
      <div className="w-full max-w-md my-auto z-10">
        <div className="id-card-frame rounded-3xl p-8 sm:p-10 text-center shadow-2xl relative overflow-hidden bg-white dark:bg-[#23040B]">
          
          {/* Top Maroon Accent Line */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#701026] via-[#881832] to-[#580B1C]" />

          {/* Icon Badge */}
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-[#FFF5F7] border border-[#F4CCD5] flex items-center justify-center text-[#701026] shadow-inner dark:bg-[#3B0511] dark:border-[#580B1C] dark:text-[#E8A5B3]">
            <ShieldAlert className="w-10 h-10" />
          </div>

          <span className="inline-block text-[11px] font-mono uppercase tracking-widest px-3 py-1 rounded-full bg-[#FFF5F7] text-[#701026] border border-[#F4CCD5] mb-3 font-semibold dark:bg-[#3B0511] dark:border-[#580B1C] dark:text-[#E8A5B3]">
            Error 404
          </span>

          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading tracking-tight text-[#580B1C] dark:text-white mb-2">
            PROFILE NOT FOUND
          </h1>

          <p className="text-[#881832] dark:text-[#E8A5B3] text-sm mb-6">
            This member profile doesn't exist.
          </p>

          {memberId && (
            <div className="mb-6 p-3 rounded-xl bg-[#FFF5F7] border border-[#F4CCD5] text-xs font-mono text-[#580B1C] dark:bg-[#150206] dark:border-[#580B1C] dark:text-[#FCE7EB]">
              Queried ID: <span className="text-[#701026] dark:text-[#E8A5B3] font-bold">{memberId}</span>
            </div>
          )}

          {/* Action Button */}
          <Link
            to="/"
            className="w-full inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#701026] to-[#580B1C] hover:from-[#580B1C] hover:to-[#3B0511] text-white font-semibold font-heading text-sm shadow-lg shadow-[#701026]/20 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <Home className="w-4 h-4" />
            <span>Back to CSI KARE</span>
          </Link>
        </div>
      </div>

      {/* Bottom Branding */}
      <div className="w-full max-w-md text-center text-xs text-[#881832] dark:text-[#E8A5B3] py-4 z-10">
        <p className="font-semibold">CSI KARE Student Chapter</p>
        <p className="text-[11px] mt-0.5 opacity-80">Core Team 2026–27</p>
      </div>
    </div>
  );
}
