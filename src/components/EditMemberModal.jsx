import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Upload, 
  Trash2, 
  Loader2, 
  Check, 
  User, 
  Mail, 
  Phone, 
  Sparkles,
  Quote as QuoteIcon,
  GraduationCap,
  ZoomIn,
  MoveHorizontal,
  MoveVertical,
  RotateCcw,
  Sliders
} from 'lucide-react';
import { InstagramIcon, LinkedinIcon } from './BrandIcons';
import { uploadImageToCloudinary } from '../services/cloudinaryService';

const YEAR_OPTIONS = [
  "2nd Year",
  "3rd Year",
  "4th Year",
  "1st Year",
  "Faculty Coordinator",
  "Alumni Advisor"
];

const COMMON_ROLES = [
  "Core Team Lead",
  "Technical Lead",
  "Events & Workshops Lead",
  "Design & Media Lead",
  "Public Relations Lead",
  "Web & App Operations Lead",
  "Competitive Programming Lead",
  "Sponsorship & Logistics Lead",
  "Content & Editorial Lead",
  "Core Executive Member"
];

export default function EditMemberModal({ 
  isOpen, 
  onClose, 
  member, 
  isNew = false, 
  onSave, 
  suggestedId = '' 
}) {
  const [formData, setFormData] = useState({
    memberId: '',
    name: '',
    role: '',
    year: '2nd Year',
    department: 'CSE (AIML) | KARE',
    quote: '',
    photoUrl: '',
    photoScale: 1,
    photoPosX: 0,
    photoPosY: 0,
    instagram: '',
    linkedin: '',
    email: '',
    phone: '',
  });

  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (member && !isNew) {
      setFormData({
        memberId: member.memberId || '',
        name: member.name || '',
        role: member.role || 'Core Team Member',
        year: member.year || '2nd Year',
        department: member.department || 'CSE (AIML) | KARE',
        quote: member.quote || '',
        photoUrl: member.photoUrl || '',
        photoScale: typeof member.photoScale === 'number' ? member.photoScale : 1,
        photoPosX: typeof member.photoPosX === 'number' ? member.photoPosX : 0,
        photoPosY: typeof member.photoPosY === 'number' ? member.photoPosY : 0,
        instagram: member.instagram || '',
        linkedin: member.linkedin || '',
        email: member.email || '',
        phone: member.phone || '',
      });
    } else if (isNew) {
      setFormData({
        memberId: suggestedId || '',
        name: '',
        role: 'Core Team Member',
        year: '2nd Year',
        department: 'CSE | KARE',
        quote: '',
        photoUrl: '',
        photoScale: 1,
        photoPosX: 0,
        photoPosY: 0,
        instagram: '',
        linkedin: '',
        email: '',
        phone: '',
      });
    }
    setError('');
  }, [member, isNew, suggestedId, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePositionChange = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: parseFloat(val) }));
  };

  const handleResetPosition = () => {
    setFormData((prev) => ({
      ...prev,
      photoScale: 1,
      photoPosX: 0,
      photoPosY: 0,
    }));
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);
    setError('');
    try {
      const uploadedUrl = await uploadImageToCloudinary(file);
      setFormData((prev) => ({ ...prev, photoUrl: uploadedUrl }));
    } catch (err) {
      console.error('Photo upload error:', err);
      setError('Photo upload failed: ' + err.message);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleRemovePhoto = () => {
    setFormData((prev) => ({ 
      ...prev, 
      photoUrl: '',
      photoScale: 1,
      photoPosX: 0,
      photoPosY: 0
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.memberId.trim()) {
      setError('Member ID is required (e.g. CSI26-001).');
      return;
    }
    if (!formData.name.trim()) {
      setError('Member Name is required.');
      return;
    }

    setSaving(true);
    try {
      await onSave({
        ...formData,
        memberId: formData.memberId.trim().toUpperCase(),
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save member profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#2E040D]/80 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div 
        className="relative w-full max-w-2xl my-8 bg-white dark:bg-[#23040B] rounded-3xl p-6 sm:p-8 border border-[#F4CCD5] dark:border-[#580B1C] shadow-2xl text-[#3B0511] dark:text-[#FCE7EB] max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-5 right-5 p-2 rounded-full text-[#881832] hover:text-[#580B1C] bg-[#FFF5F7] hover:bg-[#FCE7EB] transition-colors cursor-pointer dark:bg-[#3B0511] dark:text-[#E8A5B3] dark:hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#FFF5F7] border border-[#F4CCD5] flex items-center justify-center text-[#701026] dark:bg-[#3B0511] dark:border-[#580B1C] dark:text-[#E8A5B3]">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-heading text-[#580B1C] dark:text-white">
              {isNew ? 'Add New Core Team Member' : `Edit Member (${formData.memberId})`}
            </h2>
            <p className="text-xs text-[#881832] dark:text-[#E8A5B3]">
              Updates apply instantly to the member's physical-card digital profile.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium dark:bg-red-950/40 dark:border-red-900 dark:text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Full-Length Photo Upload Section & Live Preview */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#FFF5F7] border border-[#F4CCD5] dark:bg-[#2E040D]/60 dark:border-[#580B1C] space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold font-heading text-[#580B1C] uppercase tracking-wider dark:text-[#E8A5B3]">
                Full-Length Portrait Photo
              </label>
              {formData.photoUrl && (
                <span className="text-[11px] font-mono text-[#701026] dark:text-[#FCE7EB] bg-white/70 dark:bg-[#3B0511] px-2 py-0.5 rounded-md border border-[#F4CCD5] dark:border-[#580B1C]">
                  Live ID Card Preview
                </span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-start gap-5">
              
              {/* 4:5 Live ID Card Ratio Frame */}
              <div className="relative w-36 sm:w-40 aspect-[4/5] rounded-2xl overflow-hidden bg-white border-2 border-[#701026] flex items-center justify-center shrink-0 shadow-md dark:bg-[#150206]">
                {/* Corner Frame Accents */}
                <div className="absolute top-1.5 left-1.5 w-3 h-3 border-t-2 border-l-2 border-[#701026] z-10 pointer-events-none" />
                <div className="absolute top-1.5 right-1.5 w-3 h-3 border-t-2 border-r-2 border-[#701026] z-10 pointer-events-none" />
                <div className="absolute bottom-1.5 left-1.5 w-3 h-3 border-b-2 border-l-2 border-[#701026] z-10 pointer-events-none" />
                <div className="absolute bottom-1.5 right-1.5 w-3 h-3 border-b-2 border-r-2 border-[#701026] z-10 pointer-events-none" />

                {formData.photoUrl ? (
                  <img
                    src={formData.photoUrl}
                    alt="Preview"
                    style={{
                      transform: `scale(${formData.photoScale || 1}) translate(${formData.photoPosX || 0}%, ${formData.photoPosY || 0}%)`,
                      transformOrigin: 'center center',
                    }}
                    className="w-full h-full object-cover transition-transform duration-75"
                  />
                ) : (
                  <div className="text-center p-3 text-[#881832] opacity-60">
                    <User className="w-10 h-10 mx-auto mb-1" />
                    <span className="text-[10px] font-mono block">No photo</span>
                  </div>
                )}

                {uploadingPhoto && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20">
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  </div>
                )}

                {/* Badge ribbon tag */}
                {formData.photoUrl && (
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-[#580B1C]/90 text-[9px] font-mono text-white font-bold tracking-wider z-10">
                    4:5
                  </div>
                )}
              </div>

              {/* Upload Controls & Sliders */}
              <div className="space-y-3.5 flex-1 w-full">
                <div className="flex items-center gap-2 flex-wrap">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    id="photo-upload-input"
                  />
                  <label
                    htmlFor="photo-upload-input"
                    className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-[#701026] hover:bg-[#580B1C] text-white text-xs font-semibold shadow-sm cursor-pointer transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingPhoto ? 'Uploading to Cloudinary...' : (formData.photoUrl ? 'Change Photo' : 'Upload Photo')}</span>
                  </label>

                  {formData.photoUrl && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="inline-flex items-center space-x-1 px-3 py-2 rounded-xl bg-red-100 hover:bg-red-200 text-red-700 text-xs font-medium cursor-pointer transition-colors dark:bg-red-950/40 dark:text-red-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>

                {/* Photo Positioning Controls (Zoom, X, Y) */}
                {formData.photoUrl && (
                  <div className="p-3 bg-white dark:bg-[#1A0308] rounded-xl border border-[#F4CCD5] dark:border-[#580B1C] space-y-2.5 shadow-sm">
                    <div className="flex items-center justify-between border-b border-[#F4CCD5]/60 dark:border-[#580B1C] pb-1.5">
                      <span className="text-[11px] font-heading font-bold text-[#580B1C] dark:text-[#FCE7EB] flex items-center gap-1">
                        <Sliders className="w-3 h-3 text-[#701026] dark:text-[#E8A5B3]" />
                        Position & Zoom Controls
                      </span>
                      <button
                        type="button"
                        onClick={handleResetPosition}
                        className="text-[10px] font-heading font-medium text-[#701026] hover:text-[#580B1C] dark:text-[#E8A5B3] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw className="w-2.5 h-2.5" />
                        Reset
                      </button>
                    </div>

                    {/* Zoom / Scale */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-[#881832] dark:text-[#E8A5B3] font-medium">
                        <span className="flex items-center gap-1">
                          <ZoomIn className="w-3 h-3" /> Zoom
                        </span>
                        <span className="font-mono font-bold">{(formData.photoScale || 1).toFixed(2)}x</span>
                      </div>
                      <input
                        type="range"
                        min="0.8"
                        max="2.5"
                        step="0.05"
                        value={formData.photoScale ?? 1}
                        onChange={(e) => handlePositionChange('photoScale', e.target.value)}
                        className="w-full h-1.5 bg-[#FCE7EB] dark:bg-[#3B0511] rounded-lg appearance-none cursor-pointer accent-[#701026] dark:accent-[#E8A5B3]"
                      />
                    </div>

                    {/* Horizontal Position (X) */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-[#881832] dark:text-[#E8A5B3] font-medium">
                        <span className="flex items-center gap-1">
                          <MoveHorizontal className="w-3 h-3" /> Horizontal (X)
                        </span>
                        <span className="font-mono font-bold">
                          {(formData.photoPosX || 0) > 0 ? `+${formData.photoPosX}%` : `${formData.photoPosX || 0}%`}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="-50"
                        max="50"
                        step="1"
                        value={formData.photoPosX ?? 0}
                        onChange={(e) => handlePositionChange('photoPosX', e.target.value)}
                        className="w-full h-1.5 bg-[#FCE7EB] dark:bg-[#3B0511] rounded-lg appearance-none cursor-pointer accent-[#701026] dark:accent-[#E8A5B3]"
                      />
                    </div>

                    {/* Vertical Position (Y) */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-[#881832] dark:text-[#E8A5B3] font-medium">
                        <span className="flex items-center gap-1">
                          <MoveVertical className="w-3 h-3" /> Vertical (Y)
                        </span>
                        <span className="font-mono font-bold">
                          {(formData.photoPosY || 0) > 0 ? `+${formData.photoPosY}%` : `${formData.photoPosY || 0}%`}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="-50"
                        max="50"
                        step="1"
                        value={formData.photoPosY ?? 0}
                        onChange={(e) => handlePositionChange('photoPosY', e.target.value)}
                        className="w-full h-1.5 bg-[#FCE7EB] dark:bg-[#3B0511] rounded-lg appearance-none cursor-pointer accent-[#701026] dark:accent-[#E8A5B3]"
                      />
                    </div>
                  </div>
                )}

                <p className="text-[11px] text-[#881832] dark:text-[#E8A5B3]">
                  Position settings are saved with the member profile and applied directly to the public card.
                </p>
              </div>
            </div>
          </div>

          {/* Member Name, Role, Year, Dept */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div>
              <label className="block text-xs font-semibold font-heading text-[#580B1C] uppercase tracking-wider mb-1.5 dark:text-[#E8A5B3]">
                Permanent Member ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="memberId"
                value={formData.memberId}
                onChange={handleChange}
                disabled={!isNew}
                placeholder="e.g. CSI26-001"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFF5F7] border border-[#F4CCD5] text-sm font-mono text-[#3B0511] focus:outline-none focus:border-[#701026] disabled:opacity-60 disabled:cursor-not-allowed dark:bg-[#150206] dark:border-[#580B1C] dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold font-heading text-[#580B1C] uppercase tracking-wider mb-1.5 dark:text-[#E8A5B3]">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. KRISHNA CHAITHANYA"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFF5F7] border border-[#F4CCD5] text-sm font-heading font-semibold text-[#3B0511] focus:outline-none focus:border-[#701026] dark:bg-[#150206] dark:border-[#580B1C] dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold font-heading text-[#580B1C] uppercase tracking-wider mb-1.5 dark:text-[#E8A5B3]">
                Role / Designation
              </label>
              <input
                type="text"
                name="role"
                value={formData.role}
                onChange={handleChange}
                list="role-suggestions"
                placeholder="e.g. Core Team Lead"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFF5F7] border border-[#F4CCD5] text-sm text-[#3B0511] focus:outline-none focus:border-[#701026] dark:bg-[#150206] dark:border-[#580B1C] dark:text-white"
              />
              <datalist id="role-suggestions">
                {COMMON_ROLES.map((r) => (
                  <option key={r} value={r} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-xs font-semibold font-heading text-[#580B1C] uppercase tracking-wider mb-1.5 dark:text-[#E8A5B3]">
                Academic Year
              </label>
              <select
                name="year"
                value={formData.year}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFF5F7] border border-[#F4CCD5] text-sm text-[#3B0511] focus:outline-none focus:border-[#701026] dark:bg-[#150206] dark:border-[#580B1C] dark:text-white cursor-pointer"
              >
                {YEAR_OPTIONS.map((y) => (
                  <option key={y} value={y} className="bg-white text-black dark:bg-[#23040B] dark:text-white">
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold font-heading text-[#580B1C] uppercase tracking-wider mb-1.5 dark:text-[#E8A5B3]">
                Department / Program
              </label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                placeholder="e.g. CSE (AIML) | KARE"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFF5F7] border border-[#F4CCD5] text-sm text-[#3B0511] focus:outline-none focus:border-[#701026] dark:bg-[#150206] dark:border-[#580B1C] dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold font-heading text-[#580B1C] uppercase tracking-wider mb-1.5 dark:text-[#E8A5B3]">
                Member Quote (ID Card Script)
              </label>
              <input
                type="text"
                name="quote"
                value={formData.quote}
                onChange={handleChange}
                placeholder='e.g. "Tech People, Better Tomorrow"'
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFF5F7] border border-[#F4CCD5] text-sm font-quote-script italic text-[#580B1C] focus:outline-none focus:border-[#701026] dark:bg-[#150206] dark:border-[#580B1C] dark:text-[#FCE7EB]"
              />
            </div>

          </div>

          {/* Social & Contact Links */}
          <div className="space-y-3 pt-2 border-t border-[#F4CCD5] dark:border-[#580B1C]">
            <h3 className="text-xs font-semibold font-heading text-[#580B1C] uppercase tracking-wider dark:text-[#E8A5B3]">
              Social & Contact Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#881832]">
                  <InstagramIcon className="w-4 h-4 text-[#701026]" />
                </span>
                <input
                  type="text"
                  name="instagram"
                  value={formData.instagram}
                  onChange={handleChange}
                  placeholder="Instagram (username or URL)"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#FFF5F7] border border-[#F4CCD5] text-xs text-[#3B0511] focus:outline-none focus:border-[#701026] dark:bg-[#150206] dark:border-[#580B1C] dark:text-white"
                />
              </div>

              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#881832]">
                  <LinkedinIcon className="w-4 h-4 text-[#701026]" />
                </span>
                <input
                  type="text"
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleChange}
                  placeholder="LinkedIn (username or URL)"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#FFF5F7] border border-[#F4CCD5] text-xs text-[#3B0511] focus:outline-none focus:border-[#701026] dark:bg-[#150206] dark:border-[#580B1C] dark:text-white"
                />
              </div>

              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#881832]">
                  <Mail className="w-4 h-4 text-[#701026]" />
                </span>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email (e.g. member@klu.ac.in)"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#FFF5F7] border border-[#F4CCD5] text-xs text-[#3B0511] focus:outline-none focus:border-[#701026] dark:bg-[#150206] dark:border-[#580B1C] dark:text-white"
                />
              </div>

              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#881832]">
                  <Phone className="w-4 h-4 text-[#701026]" />
                </span>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Phone (e.g. +91 9876543210)"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#FFF5F7] border border-[#F4CCD5] text-xs text-[#3B0511] focus:outline-none focus:border-[#701026] dark:bg-[#150206] dark:border-[#580B1C] dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Modal Footer Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-[#F4CCD5] dark:border-[#580B1C]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-[#FFF5F7] hover:bg-[#FCE7EB] text-[#580B1C] text-xs font-semibold transition-colors cursor-pointer dark:bg-[#3B0511] dark:text-[#E8A5B3] dark:hover:text-white"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving || uploadingPhoto}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#701026] to-[#580B1C] hover:from-[#580B1C] hover:to-[#3B0511] text-white text-xs font-semibold shadow-md shadow-[#701026]/30 disabled:opacity-50 transition-all cursor-pointer"
            >
              {saving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>{isNew ? 'Create Member' : 'Save Changes'}</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
