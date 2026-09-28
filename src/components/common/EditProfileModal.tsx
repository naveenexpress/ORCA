import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  User as UserIcon,
  X,
  Camera,
  Check,
  Save,
  Mail,
  Phone,
  Building,
  Anchor,
  MapPin,
  Globe,
  Shield,
  Upload,
  Sparkles,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { LanguageCode } from '../../types';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_AVATARS = [
  {
    name: 'Murugan Selvam (Boat Owner)',
    url: '/murugan-avatar.jpg',
  },
  {
    name: 'Maritime Commander',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80',
  },
  {
    name: 'Ocean Scientist',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=160&auto=format&fit=crop&q=80',
  },
  {
    name: 'Coastal Extension Officer',
    url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=160&auto=format&fit=crop&q=80',
  },
];

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const { currentUser, updateUserProfile, setLanguage } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: currentUser.name || '',
    email: currentUser.email || '',
    phone: currentUser.phone || '',
    organization: currentUser.organization || '',
    landingCentre: currentUser.landingCentre || '',
    district: currentUser.district || '',
    assignedRegion: currentUser.assignedRegion || '',
    avatar: currentUser.avatar || '/murugan-avatar.jpg',
    preferredLanguage: currentUser.preferredLanguage || 'en',
  });

  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [showCustomUrlInput, setShowCustomUrlInput] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setFormData((prev) => ({ ...prev, avatar: reader.result as string }));
          setSuccessMessage(t('profile.photoUpdated', 'Profile photo updated!'));
          setTimeout(() => setSuccessMessage(''), 3000);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApplyCustomUrl = () => {
    if (customAvatarUrl.trim()) {
      setFormData((prev) => ({ ...prev, avatar: customAvatarUrl.trim() }));
      setCustomAvatarUrl('');
      setShowCustomUrlInput(false);
      setSuccessMessage(t('profile.photoUpdated', 'Profile photo updated!'));
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      organization: formData.organization,
      landingCentre: formData.landingCentre,
      district: formData.district,
      assignedRegion: formData.assignedRegion,
      avatar: formData.avatar,
      preferredLanguage: formData.preferredLanguage as LanguageCode,
    });
    setLanguage(formData.preferredLanguage as LanguageCode);
    setSuccessMessage(t('editProfileModal.success', 'Profile information saved successfully!'));
    setTimeout(() => {
      setSuccessMessage('');
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-xl bg-white border border-[#D7E7F0] dark:bg-[#24181E] dark:border-[#452D36] rounded-2xl shadow-2xl overflow-hidden text-[#123B6D] dark:text-[#FFF6EE] transition">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#D7E7F0] dark:border-[#452D36] bg-[#F4FAFD] dark:bg-[#1A111B]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-[#1769AA] to-[#123B6D] dark:from-[#D95202] dark:to-[#B8470B] text-white rounded-xl shadow-md">
              <UserIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#123B6D] dark:text-[#FFF6EE] flex items-center gap-2">
                <span>{t('editProfileModal.title', 'Edit Operator Profile')}</span>
                <span className="px-2 py-0.5 text-[10px] font-mono bg-[#EAF8F1] text-[#16845F] border border-[#BFE7D1] dark:bg-[#0C5240] dark:text-[#10B981] dark:border-[#047857] rounded-full uppercase font-bold">
                  {t(`roles.${currentUser.role}`, currentUser.role.replace('_', ' '))}
                </span>
              </h2>
              <p className="text-xs text-[#55718D] dark:text-[#D4C2B6]">
                {t('editProfileModal.subtitle', 'Update your vessel identification, contact telemetry, and profile photo')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#55718D] hover:text-[#123B6D] rounded-lg hover:bg-[#E8F8FB] dark:text-[#D4C2B6] dark:hover:text-[#FFF6EE] dark:hover:bg-[#2E1B20] transition"
            aria-label={t('common.close', 'Close')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="mx-6 mt-4 p-3 bg-[#EAF8F1] border border-[#BFE7D1] text-[#16845F] dark:bg-[#0C5240] dark:border-[#047857] dark:text-[#10B981] text-xs rounded-xl flex items-center gap-2 animate-in fade-in font-medium">
            <Check className="w-4 h-4 text-[#16845F] dark:text-[#10B981] shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[78vh] overflow-y-auto">
          {/* Avatar Section */}
          <div className="p-4 rounded-xl bg-[#F4FAFD] border border-[#D7E7F0] dark:bg-[#1E1216] dark:border-[#452D36] space-y-3 transition">
            <label className="text-xs font-bold text-[#123B6D] dark:text-[#FFF6EE] flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-[#1769AA] dark:text-[#F59E0B]" />
                <span>{t('editProfileModal.photo', 'Profile Photograph')}</span>
              </span>
              <span className="text-[10px] font-mono text-[#7890A5] dark:text-[#D4C2B6]">{t('editProfileModal.clickPresetOrUpload', 'Click preset or upload file')}</span>
            </label>

            <div className="flex items-center gap-4">
              {/* Current Avatar Preview */}
              <div className="relative group shrink-0">
                <img
                  src={formData.avatar && !formData.avatar.includes('photo-1534528741775') && !formData.avatar.includes('photo-1544717305')
                    ? formData.avatar
                    : '/murugan-avatar.jpg'}
                  alt="Profile Avatar"
                  className="w-16 h-16 rounded-full object-cover border-2 border-[#19B7C9] dark:border-[#F59E0B] shadow-md group-hover:opacity-85 transition"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition text-white"
                  title={t('header.uploadPhoto', 'Upload Photo')}
                >
                  <Upload className="w-4 h-4" />
                </button>
              </div>

              {/* Presets & Actions */}
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-[#55718D] dark:text-[#D4C2B6]">{t('editProfileModal.quickPresets', 'Quick Presets:')}</span>
                  <div className="flex items-center gap-2">
                    {PRESET_AVATARS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, avatar: preset.url }))}
                        className={`w-8 h-8 rounded-full overflow-hidden border-2 transition ${
                          formData.avatar === preset.url
                            ? 'border-[#19B7C9] ring-2 ring-[#19B7C9]/50 scale-110 dark:border-[#F59E0B] dark:ring-[#F59E0B]/50'
                            : 'border-[#D7E7F0] hover:border-[#19B7C9] dark:border-[#452D36] dark:hover:border-[#D97706]'
                        }`}
                        title={preset.name}
                      >
                        <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Prominent Upload from Computer Dropzone Button */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3 border-2 border-dashed border-[#CFE6EF] hover:border-[#19B7C9] bg-white hover:bg-[#F4FAFD] dark:border-[#F59E0B]/60 dark:hover:border-[#F59E0B] dark:bg-[#140C14]/70 dark:hover:bg-[#140C14] rounded-xl cursor-pointer transition flex items-center gap-3 group"
                >
                  <div className="p-2 rounded-xl bg-[#E8F8FB] group-hover:bg-[#1769AA] text-[#1769AA] group-hover:text-white dark:bg-[#C05615]/25 dark:group-hover:bg-[#C05615] dark:text-[#F59E0B] dark:group-hover:text-white transition shrink-0">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-[#123B6D] group-hover:text-[#1769AA] dark:text-[#FFF6EE] dark:group-hover:text-[#F59E0B] transition flex items-center gap-1.5">
                      <span>{t('editProfileModal.uploadFromComputer', 'Upload Photo from Computer')}</span>
                      <span className="px-1.5 py-0.2 text-[9px] bg-[#1769AA] dark:bg-[#C05615] text-white rounded font-mono font-bold">{t('editProfileModal.browse', 'BROWSE')}</span>
                    </p>
                    <p className="text-[10px] text-[#55718D] dark:text-[#D4C2B6]">
                      {t('editProfileModal.dropzoneHelp', 'Supports JPG, PNG, WEBP from your local files (Instant live preview)')}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowCustomUrlInput(!showCustomUrlInput)}
                    className="px-2.5 py-1 text-xs bg-white hover:bg-[#F4FAFD] border border-[#D7E7F0] text-[#55718D] hover:text-[#123B6D] dark:bg-[#24181E] dark:hover:bg-[#2E1B20] dark:border-[#563943] dark:text-[#D4C2B6] dark:hover:text-[#FFF6EE] rounded-lg transition shadow-sm"
                  >
                    {showCustomUrlInput ? t('editProfileModal.hideUrl', 'Hide URL input') : t('editProfileModal.pasteUrl', 'Or Paste Web Image URL')}
                  </button>
                </div>

                {showCustomUrlInput && (
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="url"
                      placeholder="https://example.com/avatar.jpg"
                      value={customAvatarUrl}
                      onChange={(e) => setCustomAvatarUrl(e.target.value)}
                      className="flex-1 px-3 py-1 text-xs bg-white border border-[#D7E7F0] rounded-lg text-[#123B6D] dark:bg-[#140C14] dark:border-[#452D36] dark:text-[#FFF6EE] focus:outline-none focus:border-[#19B7C9] dark:focus:border-[#F59E0B]"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCustomUrl}
                      className="px-3 py-1 bg-[#1769AA] text-white text-xs font-bold rounded-lg hover:bg-[#123B6D] dark:bg-[#C05615] dark:hover:bg-[#D95202] transition"
                    >
                      {t('editProfileModal.apply', 'Apply')}
                    </button>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          {/* Form Inputs Grid */}
          {/* Form Inputs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#123B6D] dark:text-[#FFF6EE] flex items-center gap-1.5">
                <UserIcon className="w-3.5 h-3.5 text-[#1769AA] dark:text-[#F59E0B]" />
                <span>{t('editProfileModal.fullName', 'Full Name')}</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-[#F4FAFD] border border-[#D7E7F0] text-[#123B6D] rounded-xl dark:bg-[#1E1216] dark:border-[#452D36] dark:text-[#FFF6EE] focus:outline-none focus:border-[#19B7C9] dark:focus:border-[#F59E0B]"
                placeholder="e.g. Murugan Selvam"
              />
            </div>

            {/* Email Address */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#123B6D] dark:text-[#FFF6EE] flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#1769AA] dark:text-[#F59E0B]" />
                <span>{t('editProfileModal.email', 'Email Address')}</span>
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-[#F4FAFD] border border-[#D7E7F0] text-[#123B6D] rounded-xl dark:bg-[#1E1216] dark:border-[#452D36] dark:text-[#FFF6EE] focus:outline-none focus:border-[#19B7C9] dark:focus:border-[#F59E0B]"
                placeholder="e.g. murugan@kasimedu.marine"
              />
            </div>

            {/* Phone Number */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#123B6D] dark:text-[#FFF6EE] flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#1769AA] dark:text-[#F59E0B]" />
                <span>{t('editProfileModal.phone', 'Phone / Maritime VHF Contact')}</span>
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-[#F4FAFD] border border-[#D7E7F0] text-[#123B6D] rounded-xl dark:bg-[#1E1216] dark:border-[#452D36] dark:text-[#FFF6EE] focus:outline-none focus:border-[#19B7C9] dark:focus:border-[#F59E0B]"
                placeholder="e.g. +91 98401 23456"
              />
            </div>

            {/* Organization / Guild */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#123B6D] dark:text-[#FFF6EE] flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-[#1769AA] dark:text-[#F59E0B]" />
                <span>{t('editProfileModal.organisation', 'Organization / Cooperative')}</span>
              </label>
              <input
                type="text"
                value={formData.organization}
                onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-[#F4FAFD] border border-[#D7E7F0] text-[#123B6D] rounded-xl dark:bg-[#1E1216] dark:border-[#452D36] dark:text-[#FFF6EE] focus:outline-none focus:border-[#19B7C9] dark:focus:border-[#F59E0B]"
                placeholder="e.g. Kasimedu Fishermen Cooperative"
              />
            </div>

            {/* Base Landing Centre */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#123B6D] dark:text-[#FFF6EE] flex items-center gap-1.5">
                <Anchor className="w-3.5 h-3.5 text-[#1769AA] dark:text-[#F59E0B]" />
                <span>{t('editProfileModal.basePort', 'Home Port / Landing Centre')}</span>
              </label>
              <input
                type="text"
                value={formData.landingCentre}
                onChange={(e) => setFormData({ ...formData, landingCentre: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-[#F4FAFD] border border-[#D7E7F0] text-[#123B6D] rounded-xl dark:bg-[#1E1216] dark:border-[#452D36] dark:text-[#FFF6EE] focus:outline-none focus:border-[#19B7C9] dark:focus:border-[#F59E0B]"
                placeholder="e.g. Kasimedu Fishing Harbour"
              />
            </div>

            {/* District / Coast */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#123B6D] dark:text-[#FFF6EE] flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#1769AA] dark:text-[#F59E0B]" />
                <span>{t('editProfileModal.district', 'Maritime District / State')}</span>
              </label>
              <input
                type="text"
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-[#F4FAFD] border border-[#D7E7F0] text-[#123B6D] rounded-xl dark:bg-[#1E1216] dark:border-[#452D36] dark:text-[#FFF6EE] focus:outline-none focus:border-[#19B7C9] dark:focus:border-[#F59E0B]"
                placeholder="e.g. Chennai, Tamil Nadu"
              />
            </div>
          </div>

          {/* Preferred Language */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#123B6D] dark:text-[#FFF6EE] flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-[#1769AA] dark:text-[#F59E0B]" />
              <span>{t('editProfileModal.preferredLanguage', 'Preferred Interface Language')}</span>
            </label>
            <select
              value={formData.preferredLanguage}
              onChange={(e) => setFormData({ ...formData, preferredLanguage: e.target.value as LanguageCode })}
              className="w-full px-3 py-2 text-xs bg-[#F4FAFD] border border-[#D7E7F0] text-[#123B6D] rounded-xl dark:bg-[#1E1216] dark:border-[#452D36] dark:text-[#FFF6EE] focus:outline-none focus:border-[#19B7C9] dark:focus:border-[#F59E0B]"
            >
              <option value="en">English (English)</option>
              <option value="hi">Hindi (हिंदी)</option>
              <option value="ta">Tamil (தமிழ்)</option>
              <option value="te">Telugu (తెలుగు)</option>
              <option value="ml">Malayalam (മലയാളം)</option>
              <option value="bn">Bengali (বাংলা)</option>
            </select>
          </div>

          {/* Role Badge Indicator */}
          <div className="p-3 rounded-xl bg-[#F4FAFD] border border-[#D7E7F0] dark:bg-[#1E1216] dark:border-[#452D36] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#1769AA] dark:text-[#F59E0B]" />
              <div>
                <span className="text-xs font-bold text-[#123B6D] dark:text-[#FFF6EE]">{t('profile.operatorInfo', 'Operational Role Profile')}</span>
                <p className="text-[11px] text-[#55718D] dark:text-[#D4C2B6]">{t(`roles.${currentUser.role}`, currentUser.role.replace('_', ' '))}</p>
              </div>
            </div>
            <span className="text-[10px] font-mono text-[#1769AA] dark:text-[#F59E0B]">INCOIS Fleet ID</span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#D7E7F0] dark:border-[#452D36]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#55718D] hover:text-[#123B6D] hover:bg-[#F4FAFD] dark:text-[#D4C2B6] dark:hover:text-[#FFF6EE] dark:hover:bg-[#2E1B20] rounded-xl transition"
            >
              {t('editProfileModal.cancel', 'Cancel')}
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#1769AA] to-[#123B6D] hover:from-[#19B7C9] hover:to-[#1769AA] dark:from-[#D95202] dark:to-[#B8470B] dark:hover:from-[#EA580C] dark:hover:to-[#C2410C] text-white text-xs font-bold rounded-xl shadow-md transition"
            >
              <Save className="w-4 h-4" />
              <span>{t('editProfileModal.saveChanges', 'Save Profile Changes')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
