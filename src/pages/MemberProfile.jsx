import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Mail, 
  Phone, 
  Share2, 
  ArrowLeft, 
  User, 
  Check, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { InstagramIcon, LinkedinIcon } from '../components/BrandIcons';

import { getMemberById } from '../services/memberService';
import ThemeToggle from '../components/ThemeToggle';
import SkeletonLoader from '../components/SkeletonLoader';
import InvalidProfile from './InvalidProfile';

export default function MemberProfile() {
  const { memberId } = useParams();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function fetchMember() {
      setLoading(true);
      setNotFound(false);

      try {
        const data = await getMemberById(memberId);
        if (isMounted) {
          if (data) {
            setMember(data);
          } else {
            setNotFound(true);
          }
        }
      } catch (err) {
        console.error('Failed to load member profile:', err);
        if (isMounted) setNotFound(true);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    if (memberId) {
      fetchMember();
    } else {
      setNotFound(true);
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [memberId]);

  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareData = {
      title: `${member?.name || 'Member'} | CSI KARE Core Team 2026–27`,
      text: `Check out ${member?.name || 'this member'}'s CSI KARE Core Team profile.`,
      url: shareUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Error sharing:', err);
        }
      }
    }

    // Fallback: Copy URL to clipboard
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Clipboard copy failed:', err);
    }
  };

  // Ensure valid URL scheme for social links
  const formatSocialUrl = (url, type) => {
    if (!url) return '';
    const trimmed = url.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed;
    }
    if (type === 'instagram') {
      const username = trimmed.replace(/^@/, '');
      return `https://instagram.com/${username}`;
    }
    if (type === 'linkedin') {
      return `https://linkedin.com/in/${trimmed}`;
    }
    return `https://${trimmed}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 bg-grid-pattern light:bg-slate-50">
        <SkeletonLoader />
      </div>
    );
  }

  if (notFound || !member) {
    return <InvalidProfile />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-6 bg-grid-pattern relative overflow-x-hidden selection:bg-blue-600 selection:text-white light:bg-slate-50 light:text-slate-900 transition-colors">
      
      {/* Ambient background glow effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-gradient-to-b from-blue-600/15 via-indigo-600/10 to-transparent rounded-full blur-[120px] pointer-events-none light:from-blue-400/20" />
      <div className="absolute -bottom-20 right-0 w-80 h-80 bg-sky-500/10 rounded-full blur-[100px] pointer-events-none light:bg-sky-400/15" />

      {/* Top Bar Navigation */}
      <div className="w-full max-w-md mx-auto flex items-center justify-between z-10 pt-1 pb-4">
        <Link 
          to="/" 
          className="flex items-center space-x-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors bg-slate-900/60 hover:bg-slate-900 px-3 py-1.5 rounded-full border border-slate-800 light:bg-white light:border-slate-200 light:text-slate-600 light:hover:text-slate-900"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>CSI KARE</span>
        </Link>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleShare}
            aria-label="Share Profile"
            className="p-2.5 rounded-full bg-slate-900/80 border border-slate-700/60 text-slate-300 hover:text-white hover:bg-slate-800 hover:border-blue-500/40 transition-all cursor-pointer light:bg-white light:border-slate-200 light:text-slate-700 light:hover:bg-slate-50"
            title="Share Profile Link"
          >
            {copied ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <Share2 className="w-4 h-4" />
            )}
          </button>
          <ThemeToggle />
        </div>
      </div>

      {/* Main Profile Glass Card Container */}
      <main className="w-full max-w-md mx-auto my-auto z-10 py-2">
        <div className="glass-card rounded-[2rem] p-6 sm:p-8 relative overflow-hidden shadow-2xl border border-slate-800/80 light:border-slate-200">
          
          {/* Subtle Top Blue Glowing Gradient Line */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-500 to-sky-400 opacity-90" />

          {/* Section 1: CSI KARE Headers (Exact branding format) */}
          <div className="text-center space-y-1.5 mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-400 font-bold text-xs tracking-wider uppercase shadow-inner light:bg-blue-50 light:text-blue-700 light:border-blue-200">
              <Sparkles className="w-3 h-3 text-blue-400 light:text-blue-600" />
              <span>CSI KARE</span>
            </div>

            <h2 className="text-sm font-semibold tracking-wide text-slate-300 light:text-slate-600 uppercase">
              CSI KARE STUDENT CHAPTER
            </h2>

            <div className="inline-block">
              <span className="text-xs font-mono font-bold tracking-widest text-slate-400 light:text-slate-500 bg-slate-900/70 light:bg-slate-100 px-3 py-0.5 rounded-md border border-slate-800 light:border-slate-300">
                CORE TEAM 2026–27
              </span>
            </div>
          </div>

          {/* Section 2: Member Photo */}
          <div className="flex justify-center mb-6">
            <div className="relative group">
              {/* Outer decorative neon ring */}
              <div className="absolute -inset-1.5 bg-gradient-to-tr from-blue-600 via-indigo-500 to-sky-400 rounded-full blur-md opacity-60 group-hover:opacity-100 transition duration-500" />
              
              <div className="relative w-36 h-36 sm:w-40 sm:h-40 rounded-full overflow-hidden bg-slate-900 border-2 border-slate-700/80 shadow-2xl flex items-center justify-center light:bg-slate-100 light:border-white">
                {member.photoUrl ? (
                  <img
                    src={member.photoUrl}
                    alt={member.name}
                    loading="lazy"
                    className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      // Fallback if image fails to load
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-slate-800 to-slate-900 text-slate-400 light:from-slate-200 light:to-slate-300 light:text-slate-600">
                    <User className="w-16 h-16 opacity-70" />
                  </div>
                )}
              </div>

              {/* Member ID Pill on photo */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-slate-950/90 border border-blue-500/40 text-[11px] font-mono font-bold text-blue-300 shadow-lg whitespace-nowrap light:bg-white light:text-blue-700 light:border-blue-300">
                {member.memberId}
              </div>
            </div>
          </div>

          {/* Section 3: Name, Role, Year */}
          <div className="text-center space-y-2 mb-8">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white uppercase light:text-slate-900 mt-3">
              {member.name}
            </h1>

            <div className="flex items-center justify-center">
              <span className="text-sm sm:text-base font-semibold text-blue-400 light:text-blue-600 px-3 py-0.5 rounded-lg bg-blue-500/10 border border-blue-500/20 light:bg-blue-50 light:border-blue-200">
                {member.role || 'Core Team Member'}
              </span>
            </div>

            {member.year && (
              <p className="text-xs sm:text-sm font-medium text-slate-400 light:text-slate-500">
                {member.year}
              </p>
            )}
          </div>

          {/* Section 4: Social / Contact Icon Buttons */}
          <div className="pt-2 border-t border-slate-800/80 light:border-slate-200">
            <div className="flex items-center justify-center gap-4 flex-wrap pt-4">
              
              {/* Instagram Button */}
              {member.instagram && (
                <a
                  href={formatSocialUrl(member.instagram, 'instagram')}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram Profile"
                  className="group relative flex items-center justify-center w-13 h-13 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 p-[2px] shadow-lg shadow-rose-500/20 hover:scale-110 active:scale-95 transition-all duration-200"
                  title="Instagram"
                >
                  <div className="w-full h-full bg-slate-950 group-hover:bg-transparent rounded-full flex items-center justify-center transition-colors light:bg-white">
                    <InstagramIcon className="w-5 h-5 text-white group-hover:text-white light:text-slate-800 light:group-hover:text-white transition-colors" />
                  </div>
                </a>
              )}

              {/* LinkedIn Button */}
              {member.linkedin && (
                <a
                  href={formatSocialUrl(member.linkedin, 'linkedin')}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn Profile"
                  className="group relative flex items-center justify-center w-13 h-13 rounded-full bg-gradient-to-tr from-blue-700 via-blue-600 to-sky-500 p-[2px] shadow-lg shadow-blue-500/20 hover:scale-110 active:scale-95 transition-all duration-200"
                  title="LinkedIn"
                >
                  <div className="w-full h-full bg-slate-950 group-hover:bg-transparent rounded-full flex items-center justify-center transition-colors light:bg-white">
                    <LinkedinIcon className="w-5 h-5 text-white group-hover:text-white light:text-slate-800 light:group-hover:text-white transition-colors" />
                  </div>
                </a>
              )}

              {/* Email Button */}
              {member.email && (
                <a
                  href={`mailto:${member.email.trim()}`}
                  aria-label="Send Email"
                  className="group relative flex items-center justify-center w-13 h-13 rounded-full bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 p-[2px] shadow-lg shadow-emerald-500/20 hover:scale-110 active:scale-95 transition-all duration-200"
                  title="Email"
                >
                  <div className="w-full h-full bg-slate-950 group-hover:bg-transparent rounded-full flex items-center justify-center transition-colors light:bg-white">
                    <Mail className="w-5 h-5 text-white group-hover:text-white light:text-slate-800 light:group-hover:text-white transition-colors" />
                  </div>
                </a>
              )}

              {/* Phone Button */}
              {member.phone && (
                <a
                  href={`tel:${member.phone.trim().replace(/\s+/g, '')}`}
                  aria-label="Call Phone"
                  className="group relative flex items-center justify-center w-13 h-13 rounded-full bg-gradient-to-tr from-violet-600 via-purple-600 to-indigo-500 p-[2px] shadow-lg shadow-purple-500/20 hover:scale-110 active:scale-95 transition-all duration-200"
                  title="Phone Call"
                >
                  <div className="w-full h-full bg-slate-950 group-hover:bg-transparent rounded-full flex items-center justify-center transition-colors light:bg-white">
                    <Phone className="w-5 h-5 text-white group-hover:text-white light:text-slate-800 light:group-hover:text-white transition-colors" />
                  </div>
                </a>
              )}

            </div>

            {/* Notification when no social contacts are entered */}
            {!member.instagram && !member.linkedin && !member.email && !member.phone && (
              <p className="text-center text-xs text-slate-500 pt-3">
                No contact links listed.
              </p>
            )}
          </div>
        </div>

        {/* Copy confirmation toast */}
        {copied && (
          <div className="mt-3 text-center animate-bounce">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-medium shadow-lg">
              <Check className="w-3.5 h-3.5" />
              Profile link copied to clipboard!
            </span>
          </div>
        )}
      </main>

      {/* Footer Branding */}
      <footer className="w-full max-w-md mx-auto text-center py-4 z-10">
        <p className="text-xs font-semibold text-slate-400 tracking-wide light:text-slate-600">
          CSI KARE Student Chapter
        </p>
        <p className="text-[11px] text-slate-500 light:text-slate-400 mt-0.5">
          Kalasalingam Academy of Research and Education
        </p>
      </footer>
    </div>
  );
}
