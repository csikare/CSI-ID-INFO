import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  Sparkles, 
  ArrowRight, 
  QrCode, 
  Users, 
  Shield, 
  ExternalLink,
  ChevronRight,
  Layers
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
      (m.role || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 bg-grid-pattern selection:bg-blue-600 selection:text-white light:bg-slate-50 light:text-slate-900 transition-colors flex flex-col justify-between">
      <div>
        <Navbar />

        {/* Hero Section */}
        <section className="relative pt-12 pb-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center overflow-hidden">
          
          {/* Ambient Glows */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-blue-600/20 via-indigo-600/15 to-transparent rounded-full blur-[140px] pointer-events-none light:from-blue-400/25" />

          <div className="relative z-10 space-y-6">
            
            {/* Chapter Pill */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider shadow-inner light:bg-blue-50 light:text-blue-700 light:border-blue-200">
              <Sparkles className="w-3.5 h-3.5" />
              <span>CSI KARE Student Chapter</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white light:text-slate-900">
              Core Team <span className="text-gradient">2026–27</span>
            </h1>

            <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-400 light:text-slate-600">
              Scan any physical ID card QR code or look up a member ID below to explore their personal CSI KARE profile.
            </p>

            {/* Quick Member ID Lookup Box */}
            <form onSubmit={handleQuickLookup} className="max-w-md mx-auto pt-4">
              <div className="glass-card rounded-2xl p-2 flex items-center shadow-xl border border-slate-800 light:border-slate-300">
                <div className="pl-3 pr-2 text-slate-500 font-mono text-xs">
                  <QrCode className="w-4 h-4 text-blue-400" />
                </div>
                <input
                  type="text"
                  value={quickId}
                  onChange={(e) => setQuickId(e.target.value)}
                  placeholder="Enter Member ID (e.g. CSI26-001)"
                  className="w-full bg-transparent px-2 py-2 text-xs sm:text-sm font-mono text-white placeholder:text-slate-500 focus:outline-none light:text-slate-900"
                />
                <button
                  type="submit"
                  className="shrink-0 flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-md shadow-blue-600/30 transition-all cursor-pointer"
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
              <h2 className="text-xl font-bold text-white light:text-slate-900">
                Core Team Roster
              </h2>
              <p className="text-xs text-slate-400 light:text-slate-500">
                {members.length} Registered Team Members
              </p>
            </div>

            {/* Search filter */}
            <div className="relative w-full sm:w-72">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Search className="w-3.5 h-3.5" />
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search member or role..."
                className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 light:bg-white light:border-slate-300 light:text-slate-900 shadow-sm"
              />
            </div>
          </div>

          {/* Cards Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="glass-card rounded-2xl p-5 animate-pulse space-y-3">
                  <div className="w-16 h-16 rounded-full bg-slate-800 light:bg-slate-200 mx-auto" />
                  <div className="h-4 bg-slate-800 light:bg-slate-200 rounded w-3/4 mx-auto" />
                  <div className="h-3 bg-slate-800 light:bg-slate-200 rounded w-1/2 mx-auto" />
                </div>
              ))}
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="glass-card rounded-2xl p-8 text-center text-slate-400 text-xs light:border-slate-200">
              No team members match your search criteria.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredMembers.map((member) => (
                <Link
                  key={member.memberId}
                  to={`/member/${member.memberId}`}
                  className="glass-card glass-card-hover rounded-2xl p-5 text-center flex flex-col items-center justify-between group transition-all"
                >
                  <div className="w-full flex flex-col items-center">
                    {/* Member ID chip */}
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-blue-400 mb-3 light:bg-slate-100 light:border-slate-300 light:text-blue-600">
                      {member.memberId}
                    </span>

                    {/* Photo */}
                    <div className="w-20 h-20 rounded-full overflow-hidden bg-slate-900 border-2 border-slate-800 group-hover:border-blue-500/60 shadow-lg mb-3 transition-colors light:bg-slate-200">
                      {member.photoUrl ? (
                        <img
                          src={member.photoUrl}
                          alt={member.name}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-sm text-slate-500 uppercase">
                          {(member.name || 'M').slice(0, 2)}
                        </div>
                      )}
                    </div>

                    {/* Name & Role */}
                    <h3 className="font-bold text-sm text-white group-hover:text-blue-400 transition-colors light:text-slate-900 light:group-hover:text-blue-600 line-clamp-1">
                      {member.name}
                    </h3>
                    <p className="text-[11px] text-slate-400 light:text-slate-500 line-clamp-1 mt-0.5">
                      {member.role || 'Core Team Member'}
                    </p>
                    <span className="text-[10px] text-slate-500 light:text-slate-400 mt-0.5">
                      {member.year || '2nd Year'}
                    </span>
                  </div>

                  {/* View Profile prompt */}
                  <div className="w-full pt-3 mt-3 border-t border-slate-800/80 light:border-slate-200 flex items-center justify-center space-x-1 text-[11px] text-blue-400 font-semibold group-hover:translate-x-0.5 transition-transform">
                    <span>View Profile</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Footer */}
      <footer className="w-full border-t border-slate-800/80 bg-slate-950/60 py-6 text-center text-xs text-slate-500 light:border-slate-200 light:bg-white light:text-slate-500">
        <p className="font-semibold text-slate-400 light:text-slate-600">
          CSI KARE Student Chapter
        </p>
        <p className="text-[11px] mt-0.5">
          Kalasalingam Academy of Research and Education • Core Team 2026–27
        </p>
      </footer>
    </div>
  );
}
