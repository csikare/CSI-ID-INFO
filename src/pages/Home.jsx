import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  Sparkles, 
  ArrowRight, 
  QrCode, 
  Users, 
  ChevronRight,
  GraduationCap
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { getAllMembers } from '../services/memberService';

export default function Home() {
  const [quickId, setQuickId] = useState('');
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      try {
        const data = await getAllMembers();
        setMembers(data);
      } catch (err) {
        console.error('Failed to load roster:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleQuickLookup = (e) => {
    e.preventDefault();
    if (quickId.trim()) {
      navigate(`/member/${quickId.trim().toUpperCase()}`);
    }
  };

  const filteredMembers = members.filter((m) => {
    const q = search.toLowerCase();
    return (
      (m.memberId || '').toLowerCase().includes(q) ||
      (m.name || '').toLowerCase().includes(q) ||
      (m.role || '').toLowerCase().includes(q) ||
      (m.department || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#3B0511] bg-maroon-pattern selection:bg-[#701026] selection:text-white dark:bg-[#150206] dark:text-[#FCE7EB] transition-colors flex flex-col justify-between">
      <div>
        <Navbar />

        {/* Hero Section */}
        <section className="relative pt-12 pb-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center overflow-hidden">
          
          {/* Ambient Glows */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#FCE7EB] rounded-full blur-[140px] pointer-events-none opacity-80 dark:bg-[#580B1C]/25" />

          <div className="relative z-10 space-y-6">
            
            {/* Chapter Pill */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFF5F7] border border-[#F4CCD5] text-[#701026] text-xs font-heading font-semibold uppercase tracking-wider shadow-sm dark:bg-[#3B0511] dark:border-[#580B1C] dark:text-[#E8A5B3]">
              <Sparkles className="w-3.5 h-3.5 text-[#701026] dark:text-[#E8A5B3]" />
              <span>CSI KARE Student Chapter</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl font-black font-heading tracking-tight text-[#580B1C] dark:text-white">
              Core Team <span className="text-gradient-maroon">2026–27</span>
            </h1>

            <p className="max-w-2xl mx-auto text-sm sm:text-base text-[#881832] dark:text-[#E8A5B3]">
              Scan any physical ID card QR code or look up a member ID below to explore their personal CSI KARE profile.
            </p>

            {/* Quick Member ID Lookup Box */}
            <form onSubmit={handleQuickLookup} className="max-w-md mx-auto pt-4">
              <div className="id-card-frame rounded-2xl p-2 flex items-center shadow-lg bg-white dark:bg-[#23040B] border border-[#F4CCD5] dark:border-[#580B1C]">
                <div className="pl-3 pr-2 text-[#701026] font-mono text-xs dark:text-[#E8A5B3]">
                  <QrCode className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={quickId}
                  onChange={(e) => setQuickId(e.target.value)}
                  placeholder="Enter Member ID (e.g. CSI26-001)"
                  className="w-full bg-transparent px-2 py-2 text-xs sm:text-sm font-mono text-[#3B0511] placeholder:text-[#881832]/60 focus:outline-none dark:text-white dark:placeholder:text-[#E8A5B3]/60"
                />
                <button
                  type="submit"
                  className="shrink-0 flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#701026] to-[#580B1C] hover:from-[#580B1C] hover:to-[#3B0511] text-white font-heading font-semibold text-xs shadow-md shadow-[#701026]/20 transition-all cursor-pointer"
                >
                  <span>Open</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>

          </div>
        </section>

        {/* Member Directory Grid */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold font-heading text-[#580B1C] dark:text-white">
                Core Team Roster
              </h2>
              <p className="text-xs text-[#881832] dark:text-[#E8A5B3]">
                {members.length} Registered Team Profiles
              </p>
            </div>

            {/* Search filter */}
            <div className="relative w-full sm:w-72">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#881832] dark:text-[#E8A5B3]">
                <Search className="w-3.5 h-3.5" />
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search member or role..."
                className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-white border border-[#F4CCD5] text-xs text-[#3B0511] placeholder:text-[#881832]/60 focus:outline-none focus:border-[#701026] dark:bg-[#23040B] dark:border-[#580B1C] dark:text-white dark:placeholder:text-[#E8A5B3]/60 shadow-sm"
              />
            </div>
          </div>

          {/* Cards Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="id-card-frame rounded-2xl p-5 animate-pulse space-y-3 bg-white dark:bg-[#23040B]">
                  <div className="w-full aspect-[4/5] rounded-xl bg-[#FCE7EB] dark:bg-[#3B0511]" />
                  <div className="h-4 bg-[#FCE7EB] dark:bg-[#3B0511] rounded w-3/4 mx-auto" />
                  <div className="h-3 bg-[#FCE7EB]/70 dark:bg-[#3B0511]/70 rounded w-1/2 mx-auto" />
                </div>
              ))}
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="id-card-frame rounded-2xl p-8 text-center text-[#881832] dark:text-[#E8A5B3] text-xs bg-white dark:bg-[#23040B]">
              No team members match your search criteria.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredMembers.map((member) => (
                <Link
                  key={member.memberId}
                  to={`/member/${member.memberId}`}
                  className="id-card-frame glass-card-hover rounded-2xl p-4 text-center flex flex-col items-center justify-between group transition-all bg-white dark:bg-[#23040B]"
                >
                  <div className="w-full flex flex-col items-center">
                    
                    {/* Top ID Pill */}
                    <div className="w-full flex items-center justify-between mb-2.5">
                      <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#FFF5F7] border border-[#F4CCD5] text-[#701026] dark:bg-[#3B0511] dark:border-[#580B1C] dark:text-[#E8A5B3]">
                        {member.memberId}
                      </span>
                      {member.year && (
                        <span className="text-[10px] font-heading font-medium text-[#881832] dark:text-[#E8A5B3]/80">
                          {member.year}
                        </span>
                      )}
                    </div>

                    {/* Full-Length Portrait Photo Container */}
                    <div className="w-full aspect-[4/5] rounded-xl overflow-hidden bg-gradient-to-b from-[#FFF5F7] to-[#FCE7EB] border-2 border-[#580B1C] shadow-md mb-3 dark:bg-[#150206] dark:border-[#701026]">
                      {member.photoUrl ? (
                        <img
                          src={member.photoUrl}
                          alt={member.name}
                          loading="lazy"
                          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center font-heading font-bold text-sm text-[#701026] dark:text-[#E8A5B3] uppercase">
                          <span className="text-xl">{(member.name || 'M').slice(0, 2)}</span>
                          <span className="text-[10px] opacity-70 mt-1">{member.memberId}</span>
                        </div>
                      )}
                    </div>

                    {/* Name & Role */}
                    <h3 className="font-heading font-extrabold text-sm text-[#580B1C] dark:text-white group-hover:text-[#701026] transition-colors line-clamp-1 uppercase">
                      {member.name}
                    </h3>
                    <p className="text-[11px] font-heading font-semibold text-[#881832] dark:text-[#E8A5B3] line-clamp-1 mt-0.5 uppercase">
                      {member.role || 'Core Team Member'}
                    </p>
                  </div>

                  {/* View Profile Prompt */}
                  <div className="w-full pt-2.5 mt-2.5 border-t border-[#F4CCD5] dark:border-[#580B1C] flex items-center justify-center space-x-1 text-[11px] text-[#701026] font-heading font-bold group-hover:translate-x-0.5 transition-transform dark:text-[#E8A5B3]">
                    <span>View Digital Profile</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Footer */}
      <footer className="w-full border-t border-[#F4CCD5] bg-white/70 dark:bg-[#150206]/70 dark:border-[#580B1C] py-6 text-center text-xs text-[#881832] dark:text-[#E8A5B3]">
        <p className="font-heading font-bold text-[#580B1C] dark:text-[#FCE7EB]">
          CSI KARE Student Chapter
        </p>
        <p className="text-[11px] mt-0.5 opacity-80">
          Kalasalingam Academy of Research and Education • Core Team 2026–27
        </p>
      </footer>
    </div>
  );
}
