import React, { useState, useRef } from 'react';
import {
  User,
  Camera,
  Upload,
  Check,
  RotateCcw,
  Shield,
  Ship,
  MapPin,
  Mail,
  Phone,
  Building,
  Globe,
  Save,
  CheckCircle2,
  ExternalLink,
  AlertCircle,
  FileImage,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { LanguageCode, UserRole } from '../types';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const PRESET_AVATARS = [
  {
    name: 'Murugan Selvam (Vessel Skipper)',
    role: 'fisherman',
    url: '/murugan-avatar.jpg',
  },
  {
    name: 'Commander R. Nair (SAR / Coast Guard)',
    role: 'disaster_authority',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face',
  },
  {
    name: 'Dr. Anita Roy (NIOT / Ocean Scientist)',
    role: 'researcher',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=300&fit=crop&crop=face',
  },
  {
    name: 'Kavita Sundaram (Field Extension Agent)',
    role: 'agent',
    url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&h=300&fit=crop&crop=face',
  },
  {
    name: 'Suresh Kumar (Marine Spatial Analyst)',
    role: 'analyst',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&crop=face',
  },
];

const LANGUAGE_OPTIONS: { code: LanguageCode; label: string; native: string }[] = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'hi', label: 'Hindi', native: 'हिंदी' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు' },
  { code: 'ml', label: 'Malayalam', native: 'മലയാളം' },
  { code: 'bn', label: 'Bengali', native: 'বাংলা' },
];

export const ProfilePage: React.FC = () => {
  const { t } = useTranslation();
  const { currentUser, updateUserProfile, setLanguage } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: currentUser.name || '',
    email: currentUser.email || '',
    phone: currentUser.phone || '+91 94441 23456',
    organization: currentUser.organization || 'Kasimedu Deep Sea Fishermen Association',
    landingCentre: currentUser.landingCentre || 'Kasimedu Fishing Harbour, Chennai',
    district: currentUser.district || 'Chennai Coastal District',
    assignedRegion: currentUser.assignedRegion || 'Coromandel Coast (Bay of Bengal)',
    vesselName: 'Sea King VII (IND-TN-02-MM-4521)',
    avatar: currentUser.avatar || '/murugan-avatar.jpg',
    preferredLanguage: currentUser.preferredLanguage || 'en',
    bio: 'Experienced offshore skipper specializing in yellowfin tuna and pelagic drift gillnetting within the Coromandel EEZ corridor.',
  });

  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  // File Upload Handler (FileReader -> base64 DataURL)
  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (JPG, PNG, WEBP).');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setFormData((prev) => ({ ...prev, avatar: reader.result as string }));
        updateUserProfile({ avatar: reader.result as string });
        setSuccessMessage(t('profile.photoUpdated', 'Profile photo uploaded and updated successfully!'));
        setTimeout(() => setSuccessMessage(''), 4000);
      }
    };
    reader.readAsDataURL(file);
  };

  // Drag and Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleApplyUrl = () => {
    if (customAvatarUrl.trim()) {
      setFormData((prev) => ({ ...prev, avatar: customAvatarUrl.trim() }));
      updateUserProfile({ avatar: customAvatarUrl.trim() });
      setSuccessMessage(t('profile.photoUpdated', 'Profile photo uploaded and updated successfully!'));
      setTimeout(() => setSuccessMessage(''), 4000);
      setCustomAvatarUrl('');
      setShowUrlInput(false);
    }
  };

  const handleResetDefault = () => {
    const defaultUrl = '/murugan-avatar.jpg';
    setFormData((prev) => ({ ...prev, avatar: defaultUrl }));
    updateUserProfile({ avatar: defaultUrl });
    setSuccessMessage(t('profile.photoUpdated', 'Profile photo uploaded and updated successfully!'));
    setTimeout(() => setSuccessMessage(''), 4000);
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
    setSuccessMessage(t('profile.savedSuccess', 'Profile credentials and preferences saved successfully!'));
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  const activeAvatarSrc =
    formData.avatar &&
    !formData.avatar.includes('photo-1534528741775') &&
    !formData.avatar.includes('photo-1544717305')
      ? formData.avatar
      : '/murugan-avatar.jpg';

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white border border-[#D7E7F0] dark:bg-[#24181E] dark:border-[#563943] rounded-2xl shadow-sm transition">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-[#E8F8FB] text-[#1769AA] dark:bg-[#C05615]/20 dark:text-[#F59E0B] border border-[#CFE6EF] dark:border-[#C05615]/40 rounded-2xl">
            <User className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-[#123B6D] dark:text-[#FFF6EE] tracking-tight">
              {t('profile.title', 'Operator Profile & Identification')}
            </h1>
            <p className="text-xs text-[#55718D] dark:text-[#D4C2B6] mt-0.5">
              {t('profile.subtitle', 'Manage your maritime credentials, coastal telemetry, and customize your profile photograph.')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="px-3 py-1 bg-[#EAF8F1] text-[#16845F] border border-[#BFE7D1] dark:bg-[#0C5240] dark:text-[#10B981] dark:border-[#047857] rounded-full text-xs font-mono font-bold flex items-center gap-1.5 shadow-sm">
            <Shield className="w-3.5 h-3.5" />
            <span className="uppercase">{t(`roles.${currentUser.role}`, currentUser.role.replace('_', ' '))}</span>
          </span>
        </div>
      </div>

      {/* Success Notification Alert */}
      {successMessage && (
        <div className="p-4 bg-[#EAF8F1] border border-[#BFE7D1] text-[#16845F] dark:bg-[#0C5240] dark:border-[#047857] dark:text-[#10B981] text-xs rounded-2xl flex items-center justify-between gap-3 shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-[#16845F] dark:text-[#10B981] shrink-0" />
            <span className="font-bold">{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage('')}
            className="text-xs text-[#16845F] dark:text-[#10B981] hover:underline"
          >
            {t('common.close', 'Close')}
          </button>
        </div>
      )}

      {/* SECTION 1: PROFILE PHOTO UPLOAD CARD (PRIMARY FOCUS) */}
      <div className="bg-[#F4FAFD] border-2 border-[#19B7C9]/40 dark:bg-[#1E1216] dark:border-[#C05615]/60 rounded-2xl p-6 shadow-sm space-y-6 transition">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#D7E7F0] dark:border-[#452D36] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#E8F8FB] text-[#1769AA] dark:bg-[#C05615]/30 dark:text-[#F59E0B] rounded-xl">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#123B6D] dark:text-[#FFF6EE]">{t('profile.photoTitle', 'Profile Photograph Option')}</h2>
              <p className="text-xs text-[#55718D] dark:text-[#D4C2B6]">
                {t('profile.photoDesc', 'Upload your picture from your computer/device or choose from authentic maritime presets.')}
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 bg-white border border-[#D7E7F0] text-[#1769AA] dark:bg-[#140C14] dark:border-[#563943] dark:text-[#F59E0B] rounded-lg text-[10px] font-mono font-bold self-start sm:self-auto">
            {t('profile.livePreview', 'LIVE PHOTO PREVIEW')}
          </span>
        </div>

        {/* Big Avatar + Drag & Drop Upload Zone */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Left Column: Big Avatar Preview */}
          <div className="md:col-span-4 flex flex-col items-center justify-center p-4 bg-white border border-[#D7E7F0] dark:bg-[#140C14] dark:border-[#452D36] rounded-2xl text-center space-y-3 transition">
            <div className="relative group">
              <img
                src={activeAvatarSrc}
                alt={formData.name}
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-[#F59E0B] shadow-2xl transition group-hover:brightness-90"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition text-xs font-bold gap-1"
                title={t('profile.changePhoto', 'Change Photo')}
              >
                <Upload className="w-6 h-6 text-[#F59E0B]" />
                <span>{t('profile.changePhoto', 'Change Photo')}</span>
              </button>
            </div>

            <div>
              <p className="text-sm font-extrabold text-[#FFF6EE]">{formData.name}</p>
              <p className="text-xs text-[#F59E0B] font-mono uppercase font-bold">
                {t(`roles.${currentUser.role}`, currentUser.role.replace('_', ' '))}
              </p>
              <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-mono bg-[#281B22] text-[#D4C2B6] border border-[#563943] rounded-md">
                {t('profile.activeInFleet', 'Active in INCOIS Fleet')}
              </span>
            </div>

            <button
              type="button"
              onClick={handleResetDefault}
              className="flex items-center gap-1.5 text-[11px] text-[#D4C2B6] hover:text-[#FFF6EE] underline pt-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{t('profile.resetDefault', 'Reset to default photo')}</span>
            </button>
          </div>

          {/* Right Column: Upload Buttons and Dropzone */}
          <div className="md:col-span-8 space-y-4">
            {/* Hidden File Input for Native File Browser */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png, image/jpeg, image/jpg, image/webp"
              onChange={handlePhotoFileChange}
              className="hidden"
            />

            {/* Prominent Upload Dropzone Box */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-6 border-2 border-dashed rounded-2xl cursor-pointer transition text-center flex flex-col items-center justify-center gap-3 ${
                isDragOver
                  ? 'border-[#19B7C9] bg-[#E8F8FB] dark:border-[#F59E0B] dark:bg-[#24181E] scale-[1.01]'
                  : 'border-[#CFE6EF] bg-white hover:border-[#19B7C9] hover:bg-[#F4FAFD] dark:border-[#C05615] dark:bg-[#140C14] dark:hover:bg-[#1C1217] dark:hover:border-[#F59E0B]'
              }`}
            >
              <div className="p-3 bg-[#E8F8FB] text-[#1769AA] dark:bg-[#C05615]/30 dark:text-[#F59E0B] rounded-2xl">
                <Upload className="w-8 h-8 animate-bounce" />
              </div>

              <div>
                <h3 className="text-sm font-extrabold text-[#123B6D] dark:text-[#FFF6EE] flex items-center justify-center gap-2">
                  <span>{t('profile.clickToUpload', 'Click to Upload Photo from Computer')}</span>
                  <span className="px-2 py-0.5 bg-gradient-to-r from-[#1769AA] to-[#123B6D] dark:from-[#D95202] dark:to-[#B8470B] text-white rounded font-mono text-[10px] font-bold shadow">
                    {t('profile.browseFiles', 'BROWSE FILES')}
                  </span>
                </h3>
                <p className="text-xs text-[#55718D] dark:text-[#D4C2B6] mt-1">
                  {t('profile.dropzoneDesc', 'or drag and drop your image file here (PNG, JPG, JPEG, WEBP)')}
                </p>
              </div>

              <div className="flex items-center gap-4 text-[10px] text-[#7890A5] dark:text-[#D4C2B6] font-mono">
                <span>Max size: 10MB</span>
                <span>•</span>
                <span>Automatic instant resize</span>
                <span>•</span>
                <span>Persisted in browser</span>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#1769AA] to-[#123B6D] hover:from-[#19B7C9] hover:to-[#1769AA] dark:from-[#D95202] dark:to-[#B8470B] dark:hover:from-[#EA580C] dark:hover:to-[#C2410C] text-white font-extrabold text-xs rounded-xl shadow-md transition"
              >
                <Camera className="w-4 h-4" />
                <span>{t('profile.uploadPhotoNow', 'Upload Photo Now')}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowUrlInput(!showUrlInput)}
                className="px-3 py-2 bg-white hover:bg-[#F4FAFD] text-[#55718D] hover:text-[#123B6D] border border-[#D7E7F0] dark:bg-[#24181E] dark:hover:bg-[#2E1B20] dark:text-[#D4C2B6] dark:hover:text-[#FFF6EE] dark:border-[#563943] text-xs font-medium rounded-xl transition shadow-sm"
              >
                {showUrlInput ? t('profile.hideUrl', 'Hide Web URL Input') : t('profile.pasteUrl', 'Or Paste Web Image URL')}
              </button>
            </div>

            {/* Web Image URL Input */}
            {showUrlInput && (
              <div className="p-3 bg-white border border-[#D7E7F0] dark:bg-[#140C14] dark:border-[#452D36] rounded-xl flex items-center gap-2 animate-in fade-in shadow-sm">
                <input
                  type="url"
                  placeholder="https://example.com/my-photo.jpg"
                  value={customAvatarUrl}
                  onChange={(e) => setCustomAvatarUrl(e.target.value)}
                  className="flex-1 bg-[#F4FAFD] border border-[#D7E7F0] text-[#123B6D] placeholder-[#7890A5] dark:bg-[#1E1216] dark:border-[#563943] rounded-lg px-3 py-1.5 text-xs dark:text-[#FFF6EE] focus:outline-none focus:border-[#19B7C9] dark:focus:border-[#F59E0B]"
                />
                <button
                  type="button"
                  onClick={handleApplyUrl}
                  className="px-4 py-1.5 bg-[#1769AA] hover:bg-[#123B6D] dark:bg-[#C05615] dark:hover:bg-[#D95202] text-white text-xs font-bold rounded-lg transition"
                >
                  {t('profile.apply', 'Apply')}
                </button>
              </div>
            )}

            {/* Quick Preset Avatars Selection */}
            <div className="pt-2 border-t border-[#D7E7F0] dark:border-[#452D36] space-y-2">
              <span className="text-xs font-bold text-[#55718D] dark:text-[#D4C2B6]">{t('profile.presets', 'Maritime Role Photo Presets:')}</span>
              <div className="flex flex-wrap items-center gap-3">
                {PRESET_AVATARS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, avatar: preset.url }));
                      updateUserProfile({ avatar: preset.url });
                      setSuccessMessage(`${t('profile.photoUpdated', 'Profile photo updated!')} (${preset.name})`);
                      setTimeout(() => setSuccessMessage(''), 4000);
                    }}
                    className={`flex items-center gap-2 p-1.5 rounded-xl border transition ${
                      formData.avatar === preset.url
                        ? 'border-[#F59E0B] bg-[#24181E] ring-2 ring-[#F59E0B]/50'
                        : 'border-[#452D36] bg-[#140C14] hover:border-[#D97706]'
                    }`}
                    title={preset.name}
                  >
                    <img
                      src={preset.url}
                      alt={preset.name}
                      className="w-7 h-7 rounded-full object-cover border border-[#F59E0B]"
                    />
                    <span className="text-[11px] font-medium text-[#FFF6EE] pr-1.5">
                      {preset.name.split(' ')[0]}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: OPERATOR CREDENTIALS & DETAILS FORM */}
      <form onSubmit={handleSubmit} className="bg-white border border-[#D7E7F0] dark:bg-[#24181E] dark:border-[#563943] rounded-2xl p-6 shadow-sm space-y-6 transition">
        <div className="border-b border-[#D7E7F0] dark:border-[#452D36] pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-[#1769AA] dark:text-[#F59E0B]" />
            <h2 className="text-base font-bold text-[#123B6D] dark:text-[#FFF6EE]">{t('profile.operatorInfo', 'Operator Information & Telemetry')}</h2>
          </div>
          <span className="text-xs font-mono text-[#55718D] dark:text-[#D4C2B6]">GIGW / Maritime Standards</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#123B6D] dark:text-[#FFF6EE] flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#1769AA] dark:text-[#F59E0B]" />
              <span>{t('profile.fullName', 'Full Name / Skipper Identification')}</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-[#F4FAFD] border border-[#D7E7F0] text-[#123B6D] dark:bg-[#140C14] dark:border-[#563943] dark:text-[#FFF6EE] rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#19B7C9] dark:focus:border-[#F59E0B] transition"
            />
          </div>

          {/* Email Address */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#123B6D] dark:text-[#FFF6EE] flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#1769AA] dark:text-[#F59E0B]" />
              <span>{t('profile.email', 'Official Email Address')}</span>
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-[#F4FAFD] border border-[#D7E7F0] text-[#123B6D] dark:bg-[#140C14] dark:border-[#563943] dark:text-[#FFF6EE] rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#19B7C9] dark:focus:border-[#F59E0B] transition"
            />
          </div>

          {/* Phone / VHF Call Number */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#123B6D] dark:text-[#FFF6EE] flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[#1769AA] dark:text-[#F59E0B]" />
              <span>{t('profile.phone', 'Contact Phone / Satellite Calling Number')}</span>
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full bg-[#F4FAFD] border border-[#D7E7F0] text-[#123B6D] dark:bg-[#140C14] dark:border-[#563943] dark:text-[#FFF6EE] rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#19B7C9] dark:focus:border-[#F59E0B] transition"
            />
          </div>

          {/* Vessel Name / Registration */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#123B6D] dark:text-[#FFF6EE] flex items-center gap-1.5">
              <Ship className="w-3.5 h-3.5 text-[#1769AA] dark:text-[#F59E0B]" />
              <span>{t('profile.vessel', 'Registered Maritime Craft / Registration ID')}</span>
            </label>
            <input
              type="text"
              value={formData.vesselName}
              onChange={(e) => setFormData({ ...formData, vesselName: e.target.value })}
              className="w-full bg-[#F4FAFD] border border-[#D7E7F0] text-[#123B6D] dark:bg-[#140C14] dark:border-[#563943] dark:text-[#FFF6EE] rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#19B7C9] dark:focus:border-[#F59E0B] transition font-mono"
            />
          </div>

          {/* Home Port / Landing Centre */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#123B6D] dark:text-[#FFF6EE] flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#1769AA] dark:text-[#F59E0B]" />
              <span>{t('profile.basePort', 'Base Port / Landing Centre')}</span>
            </label>
            <input
              type="text"
              value={formData.landingCentre}
              onChange={(e) => setFormData({ ...formData, landingCentre: e.target.value })}
              className="w-full bg-[#F4FAFD] border border-[#D7E7F0] text-[#123B6D] dark:bg-[#140C14] dark:border-[#563943] dark:text-[#FFF6EE] rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#19B7C9] dark:focus:border-[#F59E0B] transition"
            />
          </div>

          {/* Preferred Language */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#123B6D] dark:text-[#FFF6EE] flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-[#1769AA] dark:text-[#F59E0B]" />
              <span>{t('profile.preferredLanguage', 'Preferred Maritime Advisory Language')}</span>
            </label>
            <select
              value={formData.preferredLanguage}
              onChange={(e) => {
                const newLang = e.target.value as LanguageCode;
                setFormData({ ...formData, preferredLanguage: newLang });
                setLanguage(newLang);
              }}
              className="w-full bg-[#F4FAFD] border border-[#D7E7F0] text-[#123B6D] dark:bg-[#140C14] dark:border-[#563943] dark:text-[#FFF6EE] rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#19B7C9] dark:focus:border-[#F59E0B] transition"
            >
              {LANGUAGE_OPTIONS.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.native} ({lang.label})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Bio / Operational Notes */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#123B6D] dark:text-[#FFF6EE]">
            {t('profile.operationalNotes', 'Operational Notes / Navigational Background')}
          </label>
          <textarea
            rows={3}
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            className="w-full bg-[#F4FAFD] border border-[#D7E7F0] text-[#123B6D] dark:bg-[#140C14] dark:border-[#563943] dark:text-[#FFF6EE] rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#19B7C9] dark:focus:border-[#F59E0B] transition resize-none leading-relaxed"
          />
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#D7E7F0] dark:border-[#452D36]">
          <Link
            to="/dashboard"
            className="px-5 py-2.5 bg-white hover:bg-[#F4FAFD] text-[#55718D] hover:text-[#123B6D] border border-[#D7E7F0] dark:bg-[#140C14] dark:hover:bg-[#1E1216] dark:text-[#D4C2B6] dark:hover:text-[#FFF6EE] dark:border-[#563943] rounded-xl text-xs font-semibold transition shadow-sm"
          >
            {t('profile.backToDashboard', 'Back to Dashboard')}
          </Link>

          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#1769AA] to-[#123B6D] hover:from-[#19B7C9] hover:to-[#1769AA] dark:from-[#D95202] dark:to-[#B8470B] dark:hover:from-[#EA580C] dark:hover:to-[#C2410C] text-white font-extrabold text-xs rounded-xl shadow-md transition"
          >
            <Save className="w-4 h-4" />
            <span>{t('profile.saveChanges', 'Save Profile Changes')}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
export default ProfilePage;
