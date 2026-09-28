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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2E040D]/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div 
        className="relative w-full max-w-lg my-8 bg-white dark:bg-[#23040B] rounded-3xl p-6 sm:p-8 border border-[#F4CCD5] dark:border-[#580B1C] shadow-2xl text-[#3B0511] dark:text-[#FCE7EB]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-[#881832] hover:text-[#580B1C] bg-[#FFF5F7] hover:bg-[#FCE7EB] transition-colors cursor-pointer dark:bg-[#3B0511] dark:text-[#E8A5B3] dark:hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF5F7] text-[#701026] border border-[#F4CCD5] text-xs font-bold font-heading uppercase tracking-wider mb-2 dark:bg-[#3B0511] dark:border-[#580B1C] dark:text-[#E8A5B3]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Permanent ID Card QR</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-heading text-[#580B1C] dark:text-white">
            {member.name}
          </h2>
          <p className="text-xs text-[#881832] dark:text-[#E8A5B3]">
            {member.role} • {member.year}
          </p>
        </div>

        {/* Printable Card Preview Box */}
        <div className="maroon-panel rounded-2xl p-6 border border-[#F4CCD5]/30 shadow-inner flex flex-col items-center justify-center text-center mb-6">
          
          <h3 className="text-xs font-bold font-heading tracking-wider text-white uppercase mb-1">
            CSI KARE
          </h3>
          <p className="text-[10px] text-[#FCE7EB] font-semibold font-heading uppercase tracking-wider mb-4">
            SCAN TO VIEW PROFILE
          </p>

          {/* High Contrast QR Plate */}
          <div className="p-4 bg-white rounded-2xl shadow-xl ring-4 ring-[#E8A5B3]/30">
            <QRCodeSVG
              value={profileUrl}
              size={190}
              level="H"
              marginSize={1}
              fgColor="#580B1C"
              bgColor="#ffffff"
            />
          </div>

          {/* Member ID Badge */}
          <div className="mt-4 px-4 py-1 rounded-lg bg-[#2E040D] border border-[#E8A5B3]/50 text-xs font-mono font-bold text-[#FCE7EB]">
            {member.memberId}
          </div>

          <p className="text-[11px] font-mono text-[#F8D0D8] truncate max-w-xs mt-2 opacity-80">
            {profileUrl}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-4">
          
          <button
            onClick={() => downloadMemberQrPng(member.memberId)}
            className="flex items-center justify-center space-x-2 px-3.5 py-2.5 rounded-xl bg-[#701026] hover:bg-[#580B1C] text-white text-xs font-semibold shadow-md shadow-[#701026]/20 transition-all cursor-pointer"
          >
            <ImageIcon className="w-4 h-4" />
            <span>Download PNG</span>
          </button>

          <button
            onClick={() => downloadMemberQrSvg(member.memberId)}
            className="flex items-center justify-center space-x-2 px-3.5 py-2.5 rounded-xl bg-[#FFF5F7] hover:bg-[#FCE7EB] text-[#580B1C] text-xs font-semibold border border-[#F4CCD5] transition-all cursor-pointer dark:bg-[#3B0511] dark:border-[#580B1C] dark:text-[#FCE7EB] dark:hover:bg-[#4A0716]"
          >
            <FileCode className="w-4 h-4 text-[#881832] dark:text-[#E8A5B3]" />
            <span>Download SVG</span>
          </button>

          <button
            onClick={handleDownloadBadge}
            disabled={generatingBadge}
            className="flex items-center justify-center space-x-2 px-3.5 py-2.5 rounded-xl bg-[#580B1C] hover:bg-[#4A0716] disabled:opacity-50 text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
          >
            <CreditCard className="w-4 h-4" />
            <span>{generatingBadge ? 'Generating...' : 'Print ID Badge'}</span>
          </button>
        </div>

        {/* Bottom Utility Row */}
        <div className="flex items-center justify-between pt-3 border-t border-[#F4CCD5] dark:border-[#580B1C]">
          <button
            onClick={handleCopyUrl}
            className="flex items-center space-x-1.5 text-xs text-[#881832] hover:text-[#580B1C] transition-colors cursor-pointer dark:text-[#E8A5B3] dark:hover:text-white"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'URL Copied' : 'Copy Profile Link'}</span>
          </button>

          <a
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1.5 text-xs text-[#701026] hover:text-[#580B1C] font-semibold transition-colors dark:text-[#E8A5B3] dark:hover:text-white"
          >
            <span>Open Profile</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
