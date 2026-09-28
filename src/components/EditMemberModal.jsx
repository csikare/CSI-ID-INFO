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
  Link as LinkIcon
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
    photoUrl: '',
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
        photoUrl: member.photoUrl || '',
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
        photoUrl: '',
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
    setFormData((prev) => ({ ...prev, photoUrl: '' }));
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div 
        className="relative w-full max-w-2xl my-8 glass-card rounded-3xl p-6 sm:p-8 border border-slate-700/80 shadow-2xl text-slate-100 light:text-slate-900 light:border-slate-200 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 transition-colors cursor-pointer light:text-slate-500 light:hover:text-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 light:bg-blue-50 light:text-blue-600">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white light:text-slate-900">
              {isNew ? 'Add New Core Team Member' : `Edit Member (${formData.memberId})`}
            </h2>
            <p className="text-xs text-slate-400 light:text-slate-500">
              Changes update immediately on the permanent member profile.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium light:bg-red-50 light:text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Photo Upload Section */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 light:bg-slate-50 light:border-slate-200">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3 light:text-slate-700">
              Member Photo
            </label>
            <div className="flex items-center space-x-4">
              <div className="relative w-20 h-20 rounded-full overflow-hidden bg-slate-800 border-2 border-slate-700 flex items-center justify-center shrink-0 light:bg-slate-200">
                {formData.photoUrl ? (
                  <img
                    src={formData.photoUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-8 h-8 text-slate-500" />
                )}
                {uploadingPhoto && (
                  <div className="absolute inset-0 bg-slate-950/70 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
                  </div>
                )}
              </div>

              <div className="space-y-2 flex-1">
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
                    className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm cursor-pointer transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingPhoto ? 'Uploading...' : 'Upload to Cloudinary'}</span>
                  </label>

                  {formData.photoUrl && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="inline-flex items-center space-x-1 px-3 py-2 rounded-xl bg-red-950/30 hover:bg-red-950/60 text-red-400 border border-red-900/40 text-xs font-medium cursor-pointer transition-colors light:bg-red-50 light:text-red-600 light:border-red-200"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 light:text-slate-500">
                  Recommended: Square JPG, PNG or WebP under 5MB.
                </p>
              </div>
            </div>
          </div>

          {/* Basic Member Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 light:text-slate-700">
                Permanent Member ID <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="memberId"
                value={formData.memberId}
                onChange={handleChange}
                disabled={!isNew}
                placeholder="e.g. CSI26-001"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm font-mono text-white focus:outline-none focus:border-blue-500 disabled:opacity-60 disabled:cursor-not-allowed light:bg-white light:border-slate-300 light:text-slate-900"
              />
              <p className="text-[10px] text-slate-400 mt-1 light:text-slate-500">
                {isNew ? 'Unique ID for the member QR code URL.' : 'Permanent ID mapped to physical QR.'}
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 light:text-slate-700">
                Full Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Krishna Chaithanya"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-blue-500 light:bg-white light:border-slate-300 light:text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 light:text-slate-700">
                Role / Designation
              </label>
              <input
                type="text"
                name="role"
                value={formData.role}
                onChange={handleChange}
                list="role-suggestions"
                placeholder="e.g. Core Team Lead"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-blue-500 light:bg-white light:border-slate-300 light:text-slate-900"
              />
              <datalist id="role-suggestions">
                {COMMON_ROLES.map((r) => (
                  <option key={r} value={r} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 light:text-slate-700">
                Academic Year
              </label>
              <select
                name="year"
                value={formData.year}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-blue-500 light:bg-white light:border-slate-300 light:text-slate-900"
              >
                {YEAR_OPTIONS.map((y) => (
                  <option key={y} value={y} className="bg-slate-900 text-white light:bg-white light:text-slate-900">
                    {y}
                  </option>
                ))}
              </select>
            </div>

          </div>

          {/* Social and Contact Links */}
          <div className="space-y-3 pt-2 border-t border-slate-800 light:border-slate-200">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider light:text-slate-700">
              Social & Contact Information (Optional)
            </h3>
            <p className="text-[11px] text-slate-400 light:text-slate-500">
              Circular buttons will only appear on the public profile if a value is provided.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <InstagramIcon className="w-4 h-4 text-pink-400" />
                </span>
                <input
                  type="text"
                  name="instagram"
                  value={formData.instagram}
                  onChange={handleChange}
                  placeholder="Instagram (username or URL)"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500 light:bg-white light:border-slate-300 light:text-slate-900"
                />
              </div>

              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <LinkedinIcon className="w-4 h-4 text-blue-400" />
                </span>
                <input
                  type="text"
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleChange}
                  placeholder="LinkedIn (username or URL)"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500 light:bg-white light:border-slate-300 light:text-slate-900"
                />
              </div>

              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4 text-emerald-400" />
                </span>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email (e.g. member@klu.ac.in)"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500 light:bg-white light:border-slate-300 light:text-slate-900"
                />
              </div>

              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Phone className="w-4 h-4 text-purple-400" />
                </span>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Phone (e.g. +91 9876543210)"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500 light:bg-white light:border-slate-300 light:text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Modal Footer Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800 light:border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer light:bg-slate-100 light:text-slate-700 light:hover:bg-slate-200"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving || uploadingPhoto}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-blue-600/30 disabled:opacity-50 transition-all cursor-pointer"
            >
              {saving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving to Database...</span>
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
