import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  QrCode, 
  Edit3, 
  Eye, 
  Trash2, 
  Archive, 
  RefreshCw, 
  Users, 
  Image as ImageIcon, 
  CheckCircle2, 
  Sparkles,
  Filter,
  ArrowUpDown,
  ExternalLink,
  Shield,
  Layers
} from 'lucide-react';
import { 
  getAllMembers, 
  updateMember, 
  createMember, 
  deleteMember, 
  seedInitial80Members,
  getNextSuggestedMemberId 
} from '../services/memberService';
import EditMemberModal from '../components/EditMemberModal';
import QRModal from '../components/QRModal';
import BulkQRModal from '../components/BulkQRModal';
import Navbar from '../components/Navbar';
import { isFirebaseConfigured } from '../config/firebase';

export default function AdminDashboard() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [yearFilter, setYearFilter] = useState('ALL');
  
  // Modals state
  const [editingMember, setEditingMember] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isNewMemberModal, setIsNewMemberModal] = useState(false);
  const [qrModalMember, setQrModalMember] = useState(null);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [notification, setNotification] = useState('');

  const loadMembers = async () => {
    setLoading(true);
    try {
      const data = await getAllMembers();
      setMembers(data);
    } catch (err) {
      console.error('Failed to fetch members:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, []);

  const showToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3500);
  };

  const handleSaveMember = async (formData) => {
    if (isNewMemberModal) {
      const created = await createMember(formData);
      showToast(`Created new member profile: ${created.memberId}`);
    } else {
      await updateMember(formData.memberId, formData);
      showToast(`Updated profile for ${formData.memberId}`);
    }
    await loadMembers();
  };

  const handleDeleteMember = async (memberId, memberName) => {
    if (window.confirm(`Are you sure you want to remove member ${memberId} (${memberName})?`)) {
      try {
        await deleteMember(memberId);
        showToast(`Deleted member ${memberId}`);
        await loadMembers();
      } catch (err) {
        alert('Delete failed: ' + err.message);
      }
    }
  };

  const handleSeedDatabase = async (force = false) => {
    const confirmMsg = force 
      ? 'Reset all 80 initial member records? Any custom edits on initial records will be reset to default placeholders.'
      : 'Initialize initial 80 member records into the database?';
    
    if (window.confirm(confirmMsg)) {
      setSeeding(true);
      try {
        const res = await seedInitial80Members(force);
        showToast(`Seeded ${res.count} members into ${res.target.toUpperCase()}!`);
        await loadMembers();
      } catch (err) {
        alert('Seeding error: ' + err.message);
      } finally {
        setSeeding(false);
      }
    }
  };

  // Filter & Search
  const filteredMembers = members.filter((m) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      (m.memberId || '').toLowerCase().includes(q) ||
      (m.name || '').toLowerCase().includes(q) ||
      (m.role || '').toLowerCase().includes(q) ||
      (m.year || '').toLowerCase().includes(q);

    const matchesYear = yearFilter === 'ALL' || m.year === yearFilter;
    return matchesSearch && matchesYear;
  });

  // Calculate statistics
  const totalMembers = members.length;
  const withPhotos = members.filter((m) => Boolean(m.photoUrl)).length;
  const withSocials = members.filter((m) => Boolean(m.instagram || m.linkedin || m.email || m.phone)).length;
  const suggestedNextId = getNextSuggestedMemberId(members);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 bg-grid-pattern selection:bg-blue-600 selection:text-white light:bg-slate-50 light:text-slate-900 transition-colors">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Toast Alert */}
        {notification && (
          <div className="fixed bottom-6 right-6 z-50 animate-bounce">
            <div className="flex items-center space-x-2 px-4 py-3 rounded-2xl bg-emerald-600 text-white shadow-xl shadow-emerald-600/30 font-medium text-xs">
              <CheckCircle2 className="w-4 h-4" />
              <span>{notification}</span>
            </div>
          </div>
        )}

        {/* Dashboard Header Banner */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 relative overflow-hidden light:border-slate-200">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-3 light:bg-blue-50 light:text-blue-700">
                <Shield className="w-3.5 h-3.5" />
                <span>CSI KARE Administrator Dashboard</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white light:text-slate-900 tracking-tight">
                Core Team Member Directory
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 light:text-slate-500 mt-1">
                Manage permanent profiles and generate print-ready QR codes for physical ID cards.
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={() => {
                  setIsNewMemberModal(true);
                  setEditingMember(null);
                  setIsEditModalOpen(true);
                }}
                className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/25 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Member</span>
              </button>

              <button
                onClick={() => setIsBulkModalOpen(true)}
                className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 hover:border-slate-600 text-xs font-semibold transition-all cursor-pointer light:bg-white light:text-slate-800 light:border-slate-300 light:hover:bg-slate-50"
              >
                <Archive className="w-4 h-4 text-indigo-400" />
                <span>Generate All QR Codes</span>
              </button>

              <button
                onClick={() => handleSeedDatabase(false)}
                disabled={seeding}
                title="Initialize or sync 80 initial records"
                className="flex items-center space-x-1.5 px-3 py-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 text-xs font-medium transition-colors cursor-pointer light:bg-slate-100 light:text-slate-600 light:border-slate-200"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${seeding ? 'animate-spin text-blue-400' : ''}`} />
                <span className="hidden sm:inline">Sync Initial 80</span>
              </button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-6 border-t border-slate-800/80 light:border-slate-200">
            <div className="flex items-center space-x-4 p-4 rounded-2xl bg-slate-900/50 border border-slate-800/60 light:bg-slate-50 light:border-slate-200">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl font-bold text-white light:text-slate-900">{totalMembers}</p>
                <p className="text-[11px] text-slate-400 font-medium">Total Registered Members</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 p-4 rounded-2xl bg-slate-900/50 border border-slate-800/60 light:bg-slate-50 light:border-slate-200">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl font-bold text-white light:text-slate-900">{withPhotos}</p>
                <p className="text-[11px] text-slate-400 font-medium">Profiles with Photos</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 p-4 rounded-2xl bg-slate-900/50 border border-slate-800/60 light:bg-slate-50 light:border-slate-200">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl font-bold text-white light:text-slate-900">{withSocials}</p>
                <p className="text-[11px] text-slate-400 font-medium">With Contact/Social Info</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID, name, role, year..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 light:bg-white light:border-slate-300 light:text-slate-900 shadow-sm"
            />
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
            <div className="flex items-center space-x-2">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-blue-500 light:bg-white light:border-slate-300 light:text-slate-900 cursor-pointer"
              >
                <option value="ALL">All Academic Years</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
                <option value="1st Year">1st Year</option>
                <option value="Faculty Coordinator">Faculty Coordinator</option>
              </select>
            </div>

            <span className="text-xs text-slate-400 font-mono">
              Showing {filteredMembers.length} of {members.length}
            </span>
          </div>
        </div>

        {/* Member Table View */}
        <div className="glass-card rounded-3xl border border-slate-800 overflow-hidden shadow-2xl light:border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/80 text-[11px] font-semibold text-slate-400 uppercase tracking-wider light:bg-slate-100 light:border-slate-200 light:text-slate-600">
                  <th className="py-3.5 px-4 sm:px-6">Member ID</th>
                  <th className="py-3.5 px-4">Photo</th>
                  <th className="py-3.5 px-4">Name</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Year</th>
                  <th className="py-3.5 px-4 text-center">Contact Links</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs light:divide-slate-200">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-slate-500">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
                      Loading member records...
                    </td>
                  </tr>
                ) : filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-slate-500">
                      No members matching your search query.
                    </td>
                  </tr>
                ) : (
                  filteredMembers.map((member) => (
                    <tr 
                      key={member.memberId}
                      className="hover:bg-slate-900/50 transition-colors group light:hover:bg-slate-50"
                    >
                      {/* Member ID */}
                      <td className="py-3.5 px-4 sm:px-6 font-mono font-bold text-blue-400 light:text-blue-600">
                        {member.memberId}
                      </td>

                      {/* Photo Thumbnail */}
                      <td className="py-3.5 px-4">
                        <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-800 border border-slate-700 flex items-center justify-center light:bg-slate-200">
                          {member.photoUrl ? (
                            <img
                              src={member.photoUrl}
                              alt={member.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="font-bold text-[10px] text-slate-500 uppercase">
                              {(member.name || 'M').slice(0, 2)}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Full Name */}
                      <td className="py-3.5 px-4 font-semibold text-white light:text-slate-900">
                        {member.name}
                      </td>

                      {/* Role */}
                      <td className="py-3.5 px-4 text-slate-300 light:text-slate-700">
                        <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-[11px] light:bg-slate-100 light:border-slate-300">
                          {member.role || 'Member'}
                        </span>
                      </td>

                      {/* Year */}
                      <td className="py-3.5 px-4 text-slate-400 light:text-slate-500">
                        {member.year || '—'}
                      </td>

                      {/* Social Indicators */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center space-x-1.5 opacity-80">
                          {member.instagram && <span className="w-2 h-2 rounded-full bg-pink-500" title="Instagram configured" />}
                          {member.linkedin && <span className="w-2 h-2 rounded-full bg-blue-500" title="LinkedIn configured" />}
                          {member.email && <span className="w-2 h-2 rounded-full bg-emerald-500" title="Email configured" />}
                          {member.phone && <span className="w-2 h-2 rounded-full bg-purple-500" title="Phone configured" />}
                          {!member.instagram && !member.linkedin && !member.email && !member.phone && (
                            <span className="text-[10px] text-slate-600">—</span>
                          )}
                        </div>
                      </td>

                      {/* Action Buttons: View, Edit, QR, Delete */}
                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          
                          {/* View Profile */}
                          <a
                            href={`/member/${member.memberId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-800 transition-colors light:bg-white light:text-slate-600 light:border-slate-300 light:hover:text-slate-900"
                            title="Open Public Profile"
                          >
                            <Eye className="w-3.5 h-3.5 text-sky-400" />
                          </a>

                          {/* Edit Member */}
                          <button
                            onClick={() => {
                              setIsNewMemberModal(false);
                              setEditingMember(member);
                              setIsEditModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-800 transition-colors cursor-pointer light:bg-white light:text-slate-600 light:border-slate-300 light:hover:text-slate-900"
                            title="Edit Member Information"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-blue-400" />
                          </button>

                          {/* QR Code Preview & Download */}
                          <button
                            onClick={() => setQrModalMember(member)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-800 transition-colors cursor-pointer light:bg-white light:text-slate-600 light:border-slate-300 light:hover:text-slate-900"
                            title="Generate & Download QR"
                          >
                            <QrCode className="w-3.5 h-3.5 text-emerald-400" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleDeleteMember(member.memberId, member.name)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 bg-slate-900/80 hover:bg-red-950/40 border border-slate-800 hover:border-red-900/50 transition-colors cursor-pointer light:bg-white light:text-slate-600 light:border-slate-300 light:hover:text-red-600"
                            title="Delete Member"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>

      {/* Edit / Add Member Modal */}
      <EditMemberModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        member={editingMember}
        isNew={isNewMemberModal}
        suggestedId={suggestedNextId}
        onSave={handleSaveMember}
      />

      {/* Single Member QR Modal */}
      <QRModal
        isOpen={Boolean(qrModalMember)}
        onClose={() => setQrModalMember(null)}
        member={qrModalMember}
      />

      {/* Bulk QR Generator Modal */}
      <BulkQRModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        members={members}
      />
    </div>
  );
}
