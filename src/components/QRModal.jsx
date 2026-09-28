import React, { useEffect, useState } from 'react';
import { 
  X, 
  Download, 
  Copy, 
  ExternalLink, 
  Check, 
  FileCode, 
  Image as ImageIcon,
  Sparkles,
  CreditCard
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  getMemberUrl, 
  downloadMemberQrPng, 
  downloadMemberQrSvg, 
  generatePrintableBadgeDataUrl 
} from '../utils/qrGenerator';
import { saveAs } from 'file-saver';

export default function QRModal({ member, isOpen, onClose }) {
  const [copied, setCopied] = useState(false);
  const [generatingBadge, setGeneratingBadge] = useState(false);

  if (!isOpen || !member) return null;

  const profileUrl = getMemberUrl(member.memberId);

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownloadBadge = async () => {
    setGeneratingBadge(true);
    try {
      const badgeDataUrl = await generatePrintableBadgeDataUrl(member.memberId, member.name);
      saveAs(badgeDataUrl, `${member.memberId}_ID_CARD_BACK.png`);
    } catch (err) {
      console.error('Badge generation error:', err);
      alert('Could not generate print badge: ' + err.message);
    } finally {
      setGeneratingBadge(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div 
        className="relative w-full max-w-lg my-8 glass-card rounded-3xl p-6 sm:p-8 border border-slate-700/80 shadow-2xl text-slate-100 light:text-slate-900 light:border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white bg-slate-850 hover:bg-slate-800 transition-colors cursor-pointer light:text-slate-500 light:hover:text-slate-850"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold uppercase tracking-wider mb-2 light:bg-blue-50 light:text-blue-700">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Permanent Member QR</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white light:text-slate-900">
            {member.name}
          </h2>
          <p className="text-xs text-slate-400 light:text-slate-500">
            {member.role} • {member.year}
          </p>
        </div>

        {/* Printable Card Preview Box */}
        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-inner flex flex-col items-center justify-center text-center light:bg-slate-50 light:border-slate-300 mb-6">
          
          <h3 className="text-xs font-bold tracking-wider text-blue-400 light:text-blue-600 uppercase mb-1">
            CSI KARE
          </h3>
          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-4">
            SCAN TO VIEW PROFILE
          </p>

          {/* High Contrast QR Plate */}
          <div className="p-4 bg-white rounded-2xl shadow-xl ring-4 ring-blue-500/20">
            <QRCodeSVG
              value={profileUrl}
              size={190}
              level="H"
              marginSize={1}
              fgColor="#090d16"
              bgColor="#ffffff"
            />
          </div>

          {/* Member ID Badge */}
          <div className="mt-4 px-4 py-1 rounded-lg bg-slate-950 border border-blue-500/40 text-xs font-mono font-bold text-blue-300 light:bg-white light:text-blue-700">
            {member.memberId}
          </div>

          <p className="text-[11px] font-mono text-slate-400 truncate max-w-xs mt-2 opacity-80">
            {profileUrl}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-4">
          
          <button
            onClick={() => downloadMemberQrPng(member.memberId)}
            className="flex items-center justify-center space-x-2 px-3.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/20 transition-all cursor-pointer"
          >
            <ImageIcon className="w-4 h-4" />
            <span>Download PNG</span>
          </button>

          <button
            onClick={() => downloadMemberQrSvg(member.memberId)}
            className="flex items-center justify-center space-x-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all cursor-pointer light:bg-slate-100 light:text-slate-800 light:border-slate-300 light:hover:bg-slate-200"
          >
            <FileCode className="w-4 h-4 text-emerald-400" />
            <span>Download SVG</span>
          </button>

          <button
            onClick={handleDownloadBadge}
            disabled={generatingBadge}
            className="flex items-center justify-center space-x-2 px-3.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <CreditCard className="w-4 h-4" />
            <span>{generatingBadge ? 'Generating...' : 'ID Card Badge'}</span>
          </button>
        </div>

        {/* Bottom Utility Row */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800 light:border-slate-200">
          <button
            onClick={handleCopyUrl}
            className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer light:text-slate-600 light:hover:text-slate-900"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'URL Copied' : 'Copy Profile Link'}</span>
          </button>

          <a
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1.5 text-xs text-blue-400 hover:text-blue-300 font-semibold transition-colors"
          >
            <span>Open Profile</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
