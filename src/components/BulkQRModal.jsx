import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Archive, 
  CheckCircle2, 
  Loader2, 
  Sparkles, 
  CreditCard,
  FileArchive
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  bulkDownload80QRCodes, 
  generatePrintableBadgeDataUrl,
  generateQrPngDataUrl 
} from '../utils/qrGenerator';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export default function BulkQRModal({ isOpen, onClose, members = [] }) {
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, text: '' });
  const [includeBadges, setIncludeBadges] = useState(false);
  const [completed, setCompleted] = useState(false);

  if (!isOpen) return null;

  const handleBulkGenerate = async () => {
    setGenerating(true);
    setCompleted(false);
    setProgress({ current: 0, total: members.length, text: 'Starting bulk generation...' });

    try {
      if (!includeBadges) {
        // Standard high-res QR PNG zip
        await bulkDownload80QRCodes(members, (current, total, text) => {
          setProgress({ current, total, text });
        });
      } else {
        // Include both QR PNGs and Printable Badges
        const zip = new JSZip();
        const qrFolder = zip.folder('QR_CODES_PNG');
        const badgeFolder = zip.folder('PRINTABLE_ID_BADGES');

        const total = members.length;
        for (let i = 0; i < total; i++) {
          const m = members[i];
          setProgress({ 
            current: i + 1, 
            total, 
            text: `Processing ${m.memberId} (${m.name})...` 
          });

          // Badge
          const badgeDataUrl = await generatePrintableBadgeDataUrl(m.memberId, m.name);
          const badgeBase64 = badgeDataUrl.split(',')[1];
          badgeFolder.file(`${m.memberId}_BADGE.png`, badgeBase64, { base64: true });

          // Standard QR
          const qrDataUrl = await generateQrPngDataUrl(m.memberId, { width: 1024 });
          const qrBase64 = qrDataUrl.split(',')[1];
          qrFolder.file(`${m.memberId}.png`, qrBase64, { base64: true });
        }

        setProgress({ current: total, total, text: 'Finalizing ZIP package...' });
        const content = await zip.generateAsync({ type: 'blob' });
        saveAs(content, `CSI_KARE_${members.length}_MEMBERS_COMPLETE_QR_PACK.zip`);
      }

      setCompleted(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (err) {
      console.error('Bulk generation failed:', err);
      alert('Bulk generation failed: ' + err.message);
    } finally {
      setGenerating(false);
    }
  };

  const percent = progress.total > 0 
    ? Math.round((progress.current / progress.total) * 100) 
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-lg glass-card rounded-3xl p-6 sm:p-8 border border-slate-700/80 shadow-2xl text-slate-100 light:text-slate-900 light:border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={generating}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 transition-colors cursor-pointer light:text-slate-500 light:hover:text-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
            <Archive className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold text-white light:text-slate-900">
            Bulk QR Code Generator
          </h2>
          <p className="text-xs text-slate-400 light:text-slate-500 mt-1">
            Generate high-resolution permanent QR codes for all {members.length} members as a ZIP package.
          </p>
        </div>

        {/* Configuration Box */}
        <div className="space-y-4 mb-6">
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 text-xs space-y-2 light:bg-slate-50 light:border-slate-200">
            <div className="flex justify-between items-center text-slate-300 light:text-slate-700">
              <span className="font-semibold">Total Members to Export:</span>
              <span className="font-mono font-bold text-blue-400 text-sm light:text-blue-600">{members.length}</span>
            </div>
            <div className="flex justify-between items-center text-slate-300 light:text-slate-700">
              <span className="font-semibold">Format & Quality:</span>
              <span className="text-slate-400">1024x1024 High-Res PNG</span>
            </div>
            <div className="flex justify-between items-center text-slate-300 light:text-slate-700">
              <span className="font-semibold">Target File Structure:</span>
              <span className="font-mono text-slate-400">CSI26-001.png ...</span>
            </div>
          </div>

          {/* Option: Include print card back layout */}
          <label className="flex items-center space-x-3 p-3.5 rounded-2xl bg-slate-900/40 border border-slate-800 cursor-pointer hover:bg-slate-900/80 transition-colors light:bg-slate-50 light:border-slate-200">
            <input
              type="checkbox"
              checked={includeBadges}
              onChange={(e) => setIncludeBadges(e.target.checked)}
              disabled={generating}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 bg-slate-800 border-slate-700 cursor-pointer"
            />
            <div className="text-xs">
              <span className="font-semibold text-white light:text-slate-900 block">
                Include Print-Ready ID Card Badges
              </span>
              <span className="text-[11px] text-slate-400 light:text-slate-500">
                Adds formatted card back plates with CSI KARE branding & "SCAN TO VIEW PROFILE".
              </span>
            </div>
          </label>
        </div>

        {/* Progress Display */}
        {generating && (
          <div className="mb-6 space-y-2">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-blue-400 font-semibold truncate max-w-xs">{progress.text}</span>
              <span className="text-slate-300 font-bold">{percent}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden light:bg-slate-200">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        )}

        {completed && !generating && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center space-x-2.5 light:bg-emerald-50 light:text-emerald-700">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>Successfully generated and downloaded all {members.length} QR codes!</span>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={handleBulkGenerate}
          disabled={generating || members.length === 0}
          className="w-full flex items-center justify-center space-x-2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white text-sm font-semibold shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
        >
          {generating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Generating ({progress.current}/{progress.total})...</span>
            </>
          ) : (
            <>
              <FileArchive className="w-4 h-4" />
              <span>Generate All {members.length} QR Codes (.ZIP)</span>
            </>
          )}
        </button>

      </div>
    </div>
  );
}
