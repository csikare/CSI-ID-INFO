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
  Shield,
  GraduationCap,
  Quote as QuoteIcon
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
      showToast(`Created member: ${created.memberId}`);
    } else {
      await updateMember(formData.memberId, formData);
      showToast(`Updated member: ${formData.memberId}`);
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
      : 'Sync initial 80 member records into the database?';
    
    if (window.confirm(confirmMsg)) {
      setSeeding(true);
      try {
        const res = await seedInitial80Members(force);
        showToast(`Seeded ${res.count} members!`);
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
      (m.department || '').toLowerCase().includes(q) ||
      (m.year || '').toLowerCase().includes(q);

    const matchesYear = yearFilter === 'ALL' || m.year === yearFilter;
    return matchesSearch && matchesYear;
  });

  // Calculate statistics
  const totalMembers = members.length;
  const withPhotos = members.filter((m) => Boolean(m.photoUrl)).length;
  const withQuotes = members.filter((m) => Boolean(m.quote)).length;
  const suggestedNextId = getNextSuggestedMemberId(members);

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#3B0511] bg-maroon-pattern selection:bg-[#701026] selection:text-white dark:bg-[#150206] dark:text-[#FCE7EB] transition-colors">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Toast Alert */}
        {notification && (
          <div className="fixed bottom-6 right-6 z-50 animate-bounce">
            <div className="flex items-center space-x-2 px-4 py-3 rounded-2xl bg-[#580B1C] text-white shadow-xl font-medium text-xs border border-[#E8A5B3]/40">
              <CheckCircle2 className="w-4 h-4 text-[#E8A5B3]" />
              <span>{notification}</span>
            </div>
          </div>
        )}

        {/* Dashboard Header Banner */}
        <div className="id-card-frame rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#23040B] relative overflow-hidden shadow-xl border border-[#F4CCD5] dark:border-[#580B1C]">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#FCE7EB] rounded-full blur-[100px] pointer-events-none opacity-80 dark:bg-[#701026]/20" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FFF5F7] border border-[#F4CCD5] text-[#701026] text-xs font-heading font-semibold uppercase tracking-wider mb-3 dark:bg-[#3B0511] dark:border-[#580B1C] dark:text-[#E8A5B3]">
                <Shield className="w-3.5 h-3.5" />
                <span>CSI KARE Administrator Dashboard</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black font-heading text-[#580B1C] dark:text-white tracking-tight">
                Member Profile Management
              </h1>
              <p className="text-xs sm:text-sm text-[#881832] dark:text-[#E8A5B3] mt-1">
                Manage full-length portrait profiles and permanent QR codes for physical ID cards.
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
                className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#701026] to-[#580B1C] hover:from-[#580B1C] hover:to-[#3B0511] text-white text-xs font-heading font-semibold shadow-md shadow-[#701026]/20 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Member</span>
              </button>

              <button
                onClick={() => setIsBulkModalOpen(true)}
                className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-[#FFF5F7] hover:bg-[#FCE7EB] text-[#580B1C] border border-[#F4CCD5] text-xs font-heading font-semibold transition-all cursor-pointer dark:bg-[#2A040D] dark:text-[#FCE7EB] dark:border-[#580B1C] dark:hover:bg-[#3B0511]"
              >
                <Archive className="w-4 h-4 text-[#701026] dark:text-[#E8A5B3]" />
                <span>Bulk QR Export (.ZIP)</span>
              </button>

              <button
                onClick={() => handleSeedDatabase(false)}
                disabled={seeding}
                title="Initialize or sync 80 initial records"
                className="flex items-center space-x-1.5 px-3 py-2.5 rounded-xl bg-[#FFF5F7] hover:bg-[#FCE7EB] text-[#881832] border border-[#F4CCD5] text-xs font-medium transition-colors cursor-pointer dark:bg-[#2A040D] dark:text-[#E8A5B3] dark:border-[#580B1C]"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${seeding ? 'animate-spin text-[#701026]' : ''}`} />
                <span className="hidden sm:inline">Sync Baseline</span>
              </button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-6 border-t border-[#F4CCD5] dark:border-[#580B1C]">
            <div className="flex items-center space-x-4 p-4 rounded-2xl bg-[#FFF5F7] border border-[#F4CCD5] dark:bg-[#150206] dark:border-[#580B1C]">
              <div className="w-10 h-10 rounded-xl bg-white text-[#701026] flex items-center justify-center border border-[#F4CCD5] dark:bg-[#2E040D] dark:border-[#580B1C] dark:text-[#E8A5B3]">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl font-bold font-heading text-[#580B1C] dark:text-white">{totalMembers}</p>
                <p className="text-[11px] text-[#881832] dark:text-[#E8A5B3] font-medium">Total Registered Members</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 p-4 rounded-2xl bg-[#FFF5F7] border border-[#F4CCD5] dark:bg-[#150206] dark:border-[#580B1C]">
              <div className="w-10 h-10 rounded-xl bg-white text-[#701026] flex items-center justify-center border border-[#F4CCD5] dark:bg-[#2E040D] dark:border-[#580B1C] dark:text-[#E8A5B3]">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl font-bold font-heading text-[#580B1C] dark:text-white">{withPhotos}</p>
                <p className="text-[11px] text-[#881832] dark:text-[#E8A5B3] font-medium">With Full-Length Photos</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 p-4 rounded-2xl bg-[#FFF5F7] border border-[#F4CCD5] dark:bg-[#150206] dark:border-[#580B1C]">
              <div className="w-10 h-10 rounded-xl bg-white text-[#701026] flex items-center justify-center border border-[#F4CCD5] dark:bg-[#2E040D] dark:border-[#580B1C] dark:text-[#E8A5B3]">
                <QuoteIcon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl font-bold font-heading text-[#580B1C] dark:text-white">{withQuotes}</p>
                <p className="text-[11px] text-[#881832] dark:text-[#E8A5B3] font-medium">With Card Quotes</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#881832] dark:text-[#E8A5B3]">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID, name, role, dept, year..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#F4CCD5] text-xs text-[#3B0511] placeholder:text-[#881832]/60 focus:outline-none focus:border-[#701026] dark:bg-[#23040B] dark:border-[#580B1C] dark:text-white shadow-sm"
            />
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
            <div className="flex items-center space-x-2">
              <Filter className="w-3.5 h-3.5 text-[#881832] dark:text-[#E8A5B3]" />
              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-white border border-[#F4CCD5] text-xs text-[#3B0511] focus:outline-none focus:border-[#701026] dark:bg-[#23040B] dark:border-[#580B1C] dark:text-white cursor-pointer"
              >
                <option value="ALL">All Academic Years</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
                <option value="1st Year">1st Year</option>
                <option value="Faculty Coordinator">Faculty Coordinator</option>
              </select>
            </div>

            <span className="text-xs text-[#881832] font-mono dark:text-[#E8A5B3]">
              Showing {filteredMembers.length} of {members.length}
            </span>
          </div>
        </div>

        {/* Member Table View */}
        <div className="id-card-frame rounded-3xl border border-[#F4CCD5] overflow-hidden shadow-xl bg-white dark:bg-[#23040B] dark:border-[#580B1C]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#F4CCD5] bg-[#FFF5F7] text-[11px] font-heading font-bold text-[#580B1C] uppercase tracking-wider dark:bg-[#150206] dark:border-[#580B1C] dark:text-[#E8A5B3]">
                  <th className="py-3.5 px-4 sm:px-6">Member ID</th>
                  <th className="py-3.5 px-4">Photo</th>
                  <th className="py-3.5 px-4">Name</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Year / Dept</th>
                  <th className="py-3.5 px-4 text-center">Quote & Links</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F4CCD5]/60 text-xs dark:divide-[#580B1C]/60">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-[#881832] dark:text-[#E8A5B3]">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#701026]" />
                      Loading member records...
                    </td>
                  </tr>
                ) : filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-[#881832] dark:text-[#E8A5B3]">
                      No members matching your search query.
                    </td>
                  </tr>
                ) : (
                  filteredMembers.map((member) => (
                    <tr 
                      key={member.memberId}
                      className="hover:bg-[#FFF5F7]/80 transition-colors group dark:hover:bg-[#150206]/50"
                    >
                      {/* Member ID */}
                      <td className="py-3.5 px-4 sm:px-6 font-mono font-bold text-[#701026] dark:text-[#E8A5B3]">
                        {member.memberId}
                      </td>

                      {/* Photo Thumbnail */}
                      <td className="py-3.5 px-4">
                        <div className="w-10 h-12 rounded-lg overflow-hidden bg-[#FFF5F7] border border-[#701026] flex items-center justify-center dark:bg-[#150206]">
                          {member.photoUrl ? (
                            <img
                              src={member.photoUrl}
                              alt={member.name}
                              className="w-full h-full object-cover object-top"
                            />
                          ) : (
                            <span className="font-heading font-bold text-[10px] text-[#701026] dark:text-[#E8A5B3] uppercase">
                              {(member.name || 'M').slice(0, 2)}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Full Name */}
                      <td className="py-3.5 px-4 font-heading font-bold text-[#3B0511] dark:text-white uppercase">
                        {member.name}
                      </td>

                      {/* Role */}
                      <td className="py-3.5 px-4 text-[#580B1C] dark:text-[#FCE7EB]">
                        <span className="px-2.5 py-1 rounded-md bg-[#FFF5F7] border border-[#F4CCD5] text-[11px] font-heading font-medium dark:bg-[#150206] dark:border-[#580B1C]">
                          {member.role || 'Member'}
                        </span>
                      </td>

                      {/* Year & Dept */}
                      <td className="py-3.5 px-4 text-[#881832] dark:text-[#E8A5B3]">
                        <div>{member.year || '—'}</div>
                        {member.department && (
                          <div className="text-[10px] text-[#881832]/80 dark:text-[#E8A5B3]/70">{member.department}</div>
                        )}
                      </td>

                      {/* Quote & Social Indicators */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center space-x-1.5 opacity-85">
                          {member.quote && <span className="w-2 h-2 rounded-full bg-[#701026]" title="Quote configured" />}
                          {member.instagram && <span className="w-2 h-2 rounded-full bg-pink-600" title="Instagram configured" />}
                          {member.linkedin && <span className="w-2 h-2 rounded-full bg-blue-700" title="LinkedIn configured" />}
                          {member.email && <span className="w-2 h-2 rounded-full bg-emerald-600" title="Email configured" />}
                          {member.phone && <span className="w-2 h-2 rounded-full bg-purple-700" title="Phone configured" />}
                          {!member.quote && !member.instagram && !member.linkedin && !member.email && !member.phone && (
                            <span className="text-[10px] text-slate-400">—</span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          
                          {/* View Profile */}
                          <a
                            href={`/member/${member.memberId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg text-[#580B1C] hover:text-[#701026] bg-[#FFF5F7] hover:bg-[#FCE7EB] border border-[#F4CCD5] transition-colors dark:bg-[#150206] dark:border-[#580B1C] dark:text-[#E8A5B3]"
                            title="Open Digital Profile"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </a>

                          {/* Edit Member */}
                          <button
                            onClick={() => {
                              setIsNewMemberModal(false);
                              setEditingMember(member);
                              setIsEditModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-[#580B1C] hover:text-[#701026] bg-[#FFF5F7] hover:bg-[#FCE7EB] border border-[#F4CCD5] transition-colors cursor-pointer dark:bg-[#150206] dark:border-[#580B1C] dark:text-[#E8A5B3]"
                            title="Edit Member Information"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-[#701026] dark:text-[#E8A5B3]" />
                          </button>

                          {/* QR Code Preview & Download */}
                          <button
                            onClick={() => setQrModalMember(member)}
                            className="p-1.5 rounded-lg text-[#580B1C] hover:text-[#701026] bg-[#FFF5F7] hover:bg-[#FCE7EB] border border-[#F4CCD5] transition-colors cursor-pointer dark:bg-[#150206] dark:border-[#580B1C] dark:text-[#E8A5B3]"
                            title="Generate & Download QR"
                          >
                            <QrCode className="w-3.5 h-3.5 text-[#701026] dark:text-[#E8A5B3]" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleDeleteMember(member.memberId, member.name)}
                            className="p-1.5 rounded-lg text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors cursor-pointer dark:bg-red-950/40 dark:border-red-900"
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
