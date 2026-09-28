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
  GraduationCap,
  Quote as QuoteIcon
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
      title: `${member?.name || 'Member'} | CSI KARE Core Team`,
      text: `View ${member?.name || 'this member'}'s official CSI KARE digital profile.`,
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
      <div className="min-h-screen bg-[#FAF9F6] flex flex-col justify-center items-center p-4 dark:bg-[#1A0308]">
        <SkeletonLoader />
      </div>
    );
  }

  if (notFound || !member) {
    return <InvalidProfile />;
  }

  const quoteText = member.quote || (member.memberId === 'CSI26-001' ? 'Tech People, Better Tomorrow' : '');

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#3B0511] flex flex-col justify-between p-3 sm:p-6 bg-maroon-pattern relative overflow-x-hidden selection:bg-[#701026] selection:text-white dark:bg-[#150206] dark:text-[#FCE7EB] transition-colors">
      
      {/* Background Ambient Warm Rose & Maroon Accents */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#FCE7EB] rounded-full blur-[100px] pointer-events-none opacity-70 dark:bg-[#580B1C]/30" />
      <div className="absolute top-1/3 -right-24 w-80 h-80 bg-[#F8D0D8] rounded-full blur-[120px] pointer-events-none opacity-60 dark:bg-[#701026]/20" />
      <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-[500px] h-72 bg-[#FCE7EB] rounded-full blur-[100px] pointer-events-none opacity-80 dark:bg-[#3B0511]/40" />

      {/* Top Bar Navigation */}
      <header className="w-full max-w-xl mx-auto flex items-center justify-between z-20 pt-1 pb-3 px-1">
        <Link 
          to="/" 
          className="group flex items-center space-x-2 text-xs font-semibold text-[#580B1C] hover:text-[#701026] transition-all bg-white hover:bg-[#FFF5F7] px-3.5 py-1.5 rounded-full border border-[#F4CCD5] shadow-sm dark:bg-[#2A040D] dark:border-[#580B1C] dark:text-[#FCE7EB] dark:hover:text-white cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          <span className="font-heading tracking-wide uppercase text-[11px]">CSI KARE Portal</span>
        </Link>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleShare}
            aria-label="Share Profile"
            className="p-2.5 rounded-full bg-white border border-[#F4CCD5] text-[#580B1C] hover:bg-[#FFF5F7] hover:border-[#D98295] shadow-sm transition-all cursor-pointer dark:bg-[#2A040D] dark:border-[#580B1C] dark:text-[#FCE7EB] dark:hover:text-white"
            title="Share Profile Link"
          >
            {copied ? (
              <Check className="w-4 h-4 text-emerald-600" />
            ) : (
              <Share2 className="w-4 h-4" />
            )}
          </button>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Digital ID Card Container */}
      <main className="w-full max-w-xl mx-auto my-auto z-10 py-1">
        <div className="id-card-frame rounded-[2rem] sm:rounded-[2.25rem] overflow-hidden relative shadow-2xl transition-all duration-300">
          
          {/* Top Geometric Accent Bars (Physical ID Card Motif) */}
          <div className="relative h-3 w-full bg-gradient-to-r from-[#701026] via-[#881832] to-[#580B1C]">
            <div className="absolute top-0 right-10 w-24 h-full bg-[#E8A5B3] opacity-60 transform skew-x-12" />
            <div className="absolute top-0 right-36 w-8 h-full bg-[#FFFFFF] opacity-40 transform skew-x-12" />
          </div>

          {/* 1. CSI KARE BRAND HEADER */}
          <div className="px-6 pt-6 pb-4 text-center relative bg-white dark:bg-[#23040B]">
            
            {/* Subtle background decorative rose watermark */}
            <div className="absolute top-2 right-4 w-24 h-24 bg-rose-dots opacity-30 pointer-events-none" />

            <div className="flex items-center justify-center space-x-3 mb-2">
              <img 
                src="/logo.png" 
                alt="CSI KARE Logo" 
                className="w-12 h-12 sm:w-14 sm:h-14 object-contain drop-shadow-sm shrink-0" 
              />
              <div className="text-left">
                <h2 className="font-heading font-extrabold text-lg sm:text-xl tracking-wider text-[#580B1C] dark:text-[#FCE7EB] leading-none">
                  CSI KARE
                </h2>
                <p className="text-[10px] sm:text-[11px] font-heading font-semibold text-[#881832] dark:text-[#E8A5B3] tracking-wider uppercase mt-0.5">
                  COMPUTER SOCIETY OF INDIA
                </p>
                <p className="text-[9px] sm:text-[10px] font-heading font-bold text-[#701026] dark:text-[#F4CCD5] tracking-widest uppercase">
                  KARE STUDENT CHAPTER
                </p>
              </div>
            </div>

            {/* Thin Maroon Header Separator with Diamond Accent */}
            <div className="relative flex items-center justify-center mt-3 mb-1">
              <div className="h-[1.5px] bg-gradient-to-r from-transparent via-[#701026] to-transparent w-full opacity-40 dark:opacity-60" />
              <div className="absolute w-2.5 h-2.5 rotate-45 bg-[#701026] border border-[#FCE7EB] dark:border-[#3B0511]" />
            </div>

            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#FFF5F7] border border-[#F4CCD5] dark:bg-[#3B0511] dark:border-[#580B1C]">
              <Sparkles className="w-3 h-3 text-[#701026] dark:text-[#E8A5B3]" />
              <span className="text-[10px] font-mono font-bold tracking-widest text-[#701026] dark:text-[#FCE7EB] uppercase">
                CORE TEAM 2026–27
              </span>
            </div>
          </div>

          {/* 2 & 3. LARGE FULL-LENGTH / FULL-BODY MEMBER PHOTO CONTAINER */}
          <div className="px-4 sm:px-6 pt-2 pb-4 bg-white dark:bg-[#23040B] flex flex-col items-center">
            
            <div className="relative w-full max-w-[340px] sm:max-w-[360px] aspect-[4/5] rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-b from-[#FFF5F7] to-[#FCE7EB] border-2 border-[#580B1C] shadow-lg dark:bg-gradient-to-b dark:from-[#2E040D] dark:to-[#150206] dark:border-[#881832] group">
              
              {/* Corner Geometric Frame Accents (Physical ID card motif) */}
              <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-[#701026] z-10" />
              <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-[#701026] z-10" />
              <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-[#701026] z-10" />
              <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[#701026] z-10" />

              {/* Full-Length Member Photo */}
              {member.photoUrl ? (
                <img
                  src={member.photoUrl}
                  alt={member.name}
                  loading="eager"
                  style={{
                    transform: `scale(${member.photoScale || 1}) translate(${member.photoPosX || 0}%, ${member.photoPosY || 0}%)`,
                    transformOrigin: 'center center',
                  }}
                  className="w-full h-full object-cover transition-transform duration-300"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-[#580B1C] dark:text-[#E8A5B3] p-6 text-center">
                  <div className="w-24 h-24 rounded-full bg-white/80 border-2 border-[#701026] flex items-center justify-center mb-3 shadow-inner dark:bg-[#3B0511]">
                    <User className="w-12 h-12 text-[#701026] dark:text-[#FCE7EB]" />
                  </div>
                  <span className="font-heading font-bold text-xs uppercase tracking-wider text-[#580B1C] dark:text-[#FCE7EB]">
                    {member.name}
                  </span>
                  <span className="text-[10px] font-mono text-[#881832] dark:text-[#E8A5B3] mt-1">
                    {member.memberId}
                  </span>
                </div>
              )}

              {/* Member ID Badge Ribbon */}
              <div className="absolute bottom-3 right-3 px-3 py-1 rounded-lg bg-[#580B1C]/90 backdrop-blur-md border border-[#E8A5B3]/40 text-white shadow-md z-10 flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E8A5B3] animate-pulse" />
                <span className="text-[11px] font-mono font-bold tracking-wider">{member.memberId}</span>
              </div>
            </div>

            {/* 4. MEMBER QUOTE (Editorial Script Statement) */}
            {quoteText && (
              <div className="w-full max-w-[360px] text-center mt-4 px-3 py-1 relative">
                <div className="relative inline-block">
                  <span className="text-2xl sm:text-3xl text-[#881832] dark:text-[#E8A5B3] font-serif leading-none select-none opacity-60">
                    “
                  </span>
                  <p className="inline font-quote-script italic font-semibold text-lg sm:text-xl text-[#580B1C] dark:text-[#FCE7EB] tracking-wide px-1.5">
                    {quoteText}
                  </p>
                  <span className="text-2xl sm:text-3xl text-[#881832] dark:text-[#E8A5B3] font-serif leading-none select-none opacity-60">
                    ”
                  </span>
                </div>
                {/* Subtle Rose Underline Accent */}
                <div className="h-[1.5px] w-24 mx-auto bg-gradient-to-r from-transparent via-[#D98295] to-transparent mt-1.5 opacity-80" />
              </div>
            )}

          </div>

          {/* 5, 6, 7, 8. DEEP MAROON BOTTOM INFORMATION PANEL */}
          <div className="maroon-panel px-6 pt-7 pb-6 relative text-center text-white">
            
            {/* Background Geometric Angled Shapes */}
            <div className="absolute -top-10 -right-10 w-36 h-36 bg-[#881832] opacity-25 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-full h-1 bg-[#E8A5B3] opacity-60" />
            <div className="absolute top-0 left-0 w-24 h-full bg-white opacity-5 transform -skew-x-12 pointer-events-none" />

            {/* Member Name */}
            <h1 className="font-heading font-black text-2xl sm:text-3xl tracking-wider text-white uppercase drop-shadow-sm mb-1.5">
              {member.name}
            </h1>

            {/* Role Badge */}
            <div className="inline-block mb-3">
              <span className="font-heading font-extrabold text-xs sm:text-sm tracking-widest text-[#FCE7EB] uppercase px-3.5 py-1 rounded-md bg-white/10 border border-[#E8A5B3]/30 shadow-inner">
                {member.role || 'CORE TEAM'}
              </span>
            </div>

            {/* Department & Academic Year */}
            <div className="flex items-center justify-center gap-2 flex-wrap text-xs text-[#F8D0D8] font-medium mb-6">
              {member.department ? (
                <div className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-black/20 border border-white/10">
                  <GraduationCap className="w-3.5 h-3.5 text-[#E8A5B3]" />
                  <span>{member.department}</span>
                </div>
              ) : (
                <div className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-black/20 border border-white/10">
                  <GraduationCap className="w-3.5 h-3.5 text-[#E8A5B3]" />
                  <span>KARE Student Chapter</span>
                </div>
              )}

              {member.year && (
                <span className="font-heading font-bold text-white uppercase text-[11px] px-2.5 py-0.5 rounded-full bg-white/15 border border-white/20">
                  {member.year}
                </span>
              )}
            </div>

            {/* 8. SOCIAL & CONTACT ICONS (Maroon/White Circular Buttons) */}
            <div className="pt-4 border-t border-white/15">
              <div className="flex items-center justify-center gap-3.5 sm:gap-4 flex-wrap">
                
                {/* Instagram Button */}
                {member.instagram && (
                  <a
                    href={formatSocialUrl(member.instagram, 'instagram')}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram Profile"
                    className="group relative flex items-center justify-center w-12 h-12 rounded-full bg-[#FAF9F6] text-[#580B1C] hover:bg-white hover:scale-110 active:scale-95 transition-all duration-200 shadow-md border border-[#F4CCD5]"
                    title="Instagram"
                  >
                    <InstagramIcon className="w-5 h-5 text-[#580B1C] group-hover:scale-110 transition-transform" />
                  </a>
                )}

                {/* LinkedIn Button */}
                {member.linkedin && (
                  <a
                    href={formatSocialUrl(member.linkedin, 'linkedin')}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="LinkedIn Profile"
                    className="group relative flex items-center justify-center w-12 h-12 rounded-full bg-[#FAF9F6] text-[#580B1C] hover:bg-white hover:scale-110 active:scale-95 transition-all duration-200 shadow-md border border-[#F4CCD5]"
                    title="LinkedIn"
                  >
                    <LinkedinIcon className="w-5 h-5 text-[#580B1C] group-hover:scale-110 transition-transform" />
                  </a>
                )}

                {/* Email Button */}
                {member.email && (
                  <a
                    href={`mailto:${member.email.trim()}`}
                    aria-label="Send Email"
                    className="group relative flex items-center justify-center w-12 h-12 rounded-full bg-[#FAF9F6] text-[#580B1C] hover:bg-white hover:scale-110 active:scale-95 transition-all duration-200 shadow-md border border-[#F4CCD5]"
                    title="Email"
                  >
                    <Mail className="w-5 h-5 text-[#580B1C] group-hover:scale-110 transition-transform" />
                  </a>
                )}

                {/* Phone Button */}
                {member.phone && (
                  <a
                    href={`tel:${member.phone.trim().replace(/\s+/g, '')}`}
                    aria-label="Call Phone"
                    className="group relative flex items-center justify-center w-12 h-12 rounded-full bg-[#FAF9F6] text-[#580B1C] hover:bg-white hover:scale-110 active:scale-95 transition-all duration-200 shadow-md border border-[#F4CCD5]"
                    title="Phone"
                  >
                    <Phone className="w-5 h-5 text-[#580B1C] group-hover:scale-110 transition-transform" />
                  </a>
                )}

              </div>

              {!member.instagram && !member.linkedin && !member.email && !member.phone && (
                <p className="text-[11px] text-[#F8D0D8] opacity-80 pt-1">
                  Contact details maintained by CSI KARE Student Chapter.
                </p>
              )}
            </div>

          </div>

          {/* Bottom Card Footer Strip */}
          <div className="bg-[#2E040D] py-2.5 px-4 text-center border-t border-white/10">
            <p className="text-[10px] font-heading font-semibold text-[#E8A5B3] tracking-wider uppercase">
              CSI KARE STUDENT CHAPTER • CORE TEAM 2026–27
            </p>
          </div>

        </div>

        {/* Copy confirmation toast */}
        {copied && (
          <div className="mt-3 text-center animate-bounce">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#580B1C] text-white border border-[#E8A5B3]/40 text-xs font-medium shadow-lg">
              <Check className="w-3.5 h-3.5 text-[#E8A5B3]" />
              Profile URL copied to clipboard!
            </span>
          </div>
        )}
      </main>

      {/* Page Footer */}
      <footer className="w-full max-w-xl mx-auto text-center py-3 z-10">
        <p className="text-xs font-semibold text-[#580B1C] dark:text-[#E8A5B3]">
          Kalasalingam Academy of Research and Education
        </p>
        <p className="text-[11px] text-[#881832]/80 dark:text-[#F8D0D8]/60 mt-0.5">
          Official Digital ID Card Extension • Computer Society of India
        </p>
      </footer>
    </div>
  );
}
