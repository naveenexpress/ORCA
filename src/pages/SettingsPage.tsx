import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/authStore';
import { useOfflineStore } from '../store/offlineStore';
import { useMapStore, TileProvider } from '../store/mapStore';
import { useThemeStore, ThemeMode } from '../store/themeStore';
import { LanguageCode } from '../types';
import {
  Settings,
  Globe,
  Wifi,
  Save,
  CheckCircle,
  MapPin,
  Key,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  User as UserIcon,
  Camera,
  Upload,
  ArrowRight,
  Sun,
  Moon,
  Laptop,
  Check,
  Palette,
} from 'lucide-react';
import { EditProfileModal } from '../components/common/EditProfileModal';

export const SettingsPage: React.FC = () => {
  const { t } = useTranslation();
  const { language, setLanguage, currentUser, updateUserProfile } = useAuthStore();
  const { isSimulatedOffline, toggleSimulatedOffline } = useOfflineStore();
  const { activeTileProvider, setTileProvider, cartoApiKey, setCartoApiKey } = useMapStore();
  const { theme, setTheme, resolvedTheme } = useThemeStore();
  const [apiKeyInput, setApiKeyInput] = useState(cartoApiKey);
  const [savedNotice, setSavedNotice] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [photoNotice, setPhotoNotice] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          updateUserProfile({ avatar: reader.result });
          setPhotoNotice(true);
          setTimeout(() => setPhotoNotice(false), 3000);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setCartoApiKey(apiKeyInput.trim());
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  const activeAvatar =
    currentUser.avatar &&
    !currentUser.avatar.includes('photo-1534528741775') &&
    !currentUser.avatar.includes('photo-1544717305')
      ? currentUser.avatar
      : '/murugan-avatar.jpg';

  const themeOptions: {
    mode: ThemeMode;
    title: string;
    subtitle: string;
    icon: React.ComponentType<{ className?: string }>;
    accentColor: string;
    previewBg: string;
    previewBorder: string;
  }[] = [
    {
      mode: 'light',
      title: t('theme.lightTitle', 'Ocean Daylight (Light)'),
      subtitle: t('theme.lightSub', 'High contrast maritime whites with cyan accents. Optimal for sunlight on harbor decks & vessels.'),
      icon: Sun,
      accentColor: '#1769AA',
      previewBg: 'bg-[#F7FBFE]',
      previewBorder: 'border-[#CFE6EF]',
    },
    {
      mode: 'dark',
      title: t('theme.darkTitle', 'Sunset Espresso (Dark)'),
      subtitle: t('theme.darkSub', 'Warm amber glows and deep espresso surfaces. Reduces night glare on bridge watches & dispatch rooms.'),
      icon: Moon,
      accentColor: '#F59E0B',
      previewBg: 'bg-[#140C14]',
      previewBorder: 'border-[#563943]',
    },
    {
      mode: 'system',
      title: t('theme.systemTitle', 'System Sync (Auto)'),
      subtitle: t('theme.systemSub', 'Dynamically matches your operating system dark/light mode preference automatically.'),
      icon: Laptop,
      accentColor: '#10B981',
      previewBg: 'bg-gradient-to-r from-[#F7FBFE] to-[#140C14]',
      previewBorder: 'border-[#7890A5]',
    },
  ];

  return (
    <div className="space-y-6 pb-12 max-w-3xl mx-auto">
      {/* Hidden File Input for Instant Photo Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handlePhotoUpload}
        className="hidden"
      />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white border border-[#D7E7F0] dark:bg-[#24181E] dark:border-[#563943] rounded-2xl shadow-sm transition">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#E8F8FB] text-[#1769AA] dark:bg-[#C05615]/20 dark:text-[#F59E0B] rounded-xl border border-[#CFE6EF] dark:border-[#C05615]/40">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#123B6D] dark:text-[#FFF6EE]">
              {t('settings.title', 'System & Profile Preferences')}
            </h1>
            <p className="text-xs text-[#55718D] dark:text-[#D4C2B6]">
              {t('settings.subtitle', 'Manage light/dark theme, maritime telemetry units, language display, and profile photo.')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/profile"
            className="flex items-center gap-2 px-4 py-2 bg-[#F4FAFD] hover:bg-[#E8F8FB] border border-[#D7E7F0] text-[#123B6D] dark:bg-[#1E1216] dark:hover:bg-[#281B22] dark:border-[#C05615]/70 dark:text-[#FFF6EE] text-xs font-bold rounded-xl shadow-sm transition"
          >
            <UserIcon className="w-4 h-4 text-[#1769AA] dark:text-[#F59E0B]" />
            <span>{t('settings.fullProfile', 'Full Profile')}</span>
          </Link>

          <button
            type="button"
            onClick={() => setIsProfileModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#1769AA] to-[#123B6D] hover:from-[#19B7C9] hover:to-[#1769AA] dark:from-[#D95202] dark:to-[#B8470B] dark:hover:from-[#EA580C] dark:hover:to-[#C2410C] text-white text-xs font-bold rounded-xl shadow-md transition self-start sm:self-auto shrink-0"
          >
            <span>{t('settings.editProfile', 'Edit Profile')}</span>
          </button>
        </div>
      </div>

      {photoNotice && (
        <div className="p-3 bg-[#EAF8F1] border border-[#BFE7D1] text-[#16845F] dark:bg-[#0C5240] dark:border-[#047857] dark:text-[#10B981] text-xs rounded-xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-[#16845F] dark:text-[#10B981]" />
          <span>{t('profile.photoUpdated', 'Profile photograph updated successfully!')}</span>
        </div>
      )}

      {/* EMBEDDED PROFILE & PHOTO CARD */}
      <div className="bg-[#F4FAFD] border-2 border-[#19B7C9]/40 dark:bg-[#1E1216] dark:border-[#C05615]/60 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-5 transition">
        <div className="flex items-center gap-4">
          <div className="relative group shrink-0">
            <img
              src={activeAvatar}
              alt={currentUser.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-[#19B7C9] dark:border-[#F59E0B] shadow-md group-hover:brightness-90 transition"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-white"
              title={t('header.uploadPhoto', 'Upload Photo')}
            >
              <Camera className="w-5 h-5 text-white" />
            </button>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#123B6D] dark:text-[#FFF6EE]">{currentUser.name}</h3>
              <span className="px-2 py-0.5 text-[9px] font-mono bg-[#EAF8F1] text-[#16845F] border border-[#BFE7D1] dark:bg-[#0C5240] dark:text-[#10B981] dark:border-[#047857] rounded-full uppercase font-bold">
                {t(`roles.${currentUser.role}`, currentUser.role.replace('_', ' '))}
              </span>
            </div>
            <p className="text-xs text-[#55718D] dark:text-[#D4C2B6]">{currentUser.email}</p>
            <p className="text-[11px] text-[#1769AA] dark:text-[#F59E0B] mt-0.5">
              {currentUser.landingCentre || 'Kasimedu Fishing Harbour, Chennai'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {/* Direct Photo Upload Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#1769AA] to-[#123B6D] hover:from-[#19B7C9] hover:to-[#1769AA] dark:from-[#D95202] dark:to-[#B8470B] dark:hover:from-[#EA580C] dark:hover:to-[#C2410C] text-white font-extrabold text-xs rounded-xl shadow-md transition"
          >
            <Upload className="w-4 h-4" />
            <span>{t('header.uploadPhoto', 'Upload Photo')}</span>
          </button>

          <Link
            to="/profile"
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-white hover:bg-[#E8F8FB] border border-[#D7E7F0] text-[#55718D] hover:text-[#123B6D] dark:bg-[#140C14] dark:hover:bg-[#281B22] dark:border-[#563943] dark:text-[#D4C2B6] dark:hover:text-[#FFF6EE] rounded-xl text-xs font-semibold transition shadow-sm"
          >
            <span>{t('common.details', 'Details')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* APPEARANCE & THEME CONFIGURATION CARD */}
      <div className="bg-white dark:bg-[#24181E] border border-[#D7E7F0] dark:border-[#563943] rounded-2xl p-6 shadow-sm space-y-4 transition">
        <div className="flex items-center justify-between border-b border-[#D7E7F0] dark:border-[#452D36] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#E8F8FB] dark:bg-[#C05615]/20 text-[#1769AA] dark:text-[#F59E0B] rounded-xl border border-[#CFE6EF] dark:border-[#C05615]/40">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#123B6D] dark:text-[#FFF6EE] flex items-center gap-2">
                <span>{t('theme.sectionTitle', 'Appearance & Operational Theme')}</span>
                <span className="px-2 py-0.5 text-[9px] font-mono bg-[#E8F8FB] text-[#1769AA] border border-[#CFE6EF] dark:bg-[#2E1B20] dark:text-[#F59E0B] dark:border-[#452D36] rounded-full uppercase font-bold">
                  {resolvedTheme === 'dark' ? 'DARK ACTIVE' : 'LIGHT ACTIVE'}
                </span>
              </h2>
              <p className="text-xs text-[#55718D] dark:text-[#D4C2B6]">
                {t('theme.sectionSubtitle', 'Switch between Ocean Daylight and Sunset Espresso palettes for optimal maritime visibility.')}
              </p>
            </div>
          </div>
        </div>

        {/* Theme Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1">
          {themeOptions.map((opt) => {
            const Icon = opt.icon;
            const isSelected = theme === opt.mode;
            return (
              <button
                key={opt.mode}
                type="button"
                onClick={() => setTheme(opt.mode)}
                className={`relative flex flex-col text-left p-4 rounded-xl border-2 transition duration-200 group ${
                  isSelected
                    ? 'border-[#19B7C9] bg-[#E8F8FB]/60 ring-2 ring-[#19B7C9]/40 dark:border-[#F59E0B] dark:bg-[#2E1B20] dark:ring-[#F59E0B]/30'
                    : 'border-[#D7E7F0] bg-white hover:border-[#19B7C9]/60 hover:bg-[#F4FAFD] dark:border-[#452D36] dark:bg-[#1E1216] dark:hover:border-[#C05615]/70 dark:hover:bg-[#281B22]'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center border transition ${
                      isSelected
                        ? 'bg-[#1769AA] text-white border-[#1769AA] dark:bg-[#C05615] dark:text-white dark:border-[#D97706]'
                        : 'bg-[#F4FAFD] text-[#55718D] border-[#D7E7F0] group-hover:text-[#123B6D] dark:bg-[#140C14] dark:text-[#D4C2B6] dark:border-[#563943] dark:group-hover:text-[#FFF6EE]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  {isSelected && (
                    <span className="w-5 h-5 rounded-full bg-[#19B7C9] dark:bg-[#F59E0B] text-white flex items-center justify-center shadow-sm">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-[#123B6D] dark:text-[#FFF6EE]">
                    {opt.title}
                  </h4>
                  <p className="text-[11px] text-[#55718D] dark:text-[#D4C2B6] leading-relaxed">
                    {opt.subtitle}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {savedNotice && (
        <div className="p-3 bg-[#EAF8F1] border border-[#BFE7D1] text-[#16845F] dark:bg-emerald-950/60 dark:border-emerald-800 dark:text-emerald-300 text-xs rounded-xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-[#16845F] dark:text-emerald-400" />
          <span>{t('settings.settingsSaved', 'Settings saved successfully.')}</span>
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="bg-white dark:bg-[#24181E] border border-[#D7E7F0] dark:border-[#452D36] rounded-2xl p-6 shadow-sm space-y-6 transition">
        {/* Language Selection */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-[#123B6D] dark:text-white flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#1769AA] dark:text-cyan-400" />
            <span>{t('settings.preferredLanguage', 'Preferred Operational Language (GIGW Compliant Unicode)')}</span>
          </label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as LanguageCode)}
            className="w-full bg-[#F4FAFD] dark:bg-[#140C14] border border-[#D7E7F0] dark:border-[#452D36] rounded-xl px-3 py-2 text-xs text-[#123B6D] dark:text-white focus:outline-none focus:border-[#19B7C9] dark:focus:border-[#F59E0B]"
          >
            <option value="en">English (Official Maritime Standard)</option>
            <option value="hi">हिंदी (Hindi)</option>
            <option value="ta">தமிழ் (Tamil - Chennai/Kasimedu)</option>
            <option value="te">తెలుగు (Telugu - Visakhapatnam/Kakinada)</option>
            <option value="ml">മലയാളം (Malayalam - Cochin/Thoppumpady)</option>
            <option value="bn">বাংলা (Bengali - Paradip/Digha)</option>
          </select>
        </div>

        {/* Distance Units */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-[#123B6D] dark:text-white">{t('settings.distanceUnits', 'Default Distance & Navigation Units')}</label>
          <select
            defaultValue="NM"
            className="w-full bg-[#F4FAFD] dark:bg-[#140C14] border border-[#D7E7F0] dark:border-[#452D36] rounded-xl px-3 py-2 text-xs text-[#123B6D] dark:text-white focus:outline-none focus:border-[#19B7C9] dark:focus:border-[#F59E0B]"
          >
            <option value="NM">{t('settings.nauticalMiles', 'Nautical Miles (NM) + Kilometers (km)')}</option>
            <option value="KM">{t('settings.kilometersOnly', 'Kilometers Only')}</option>
          </select>
        </div>

        {/* GIS Map & CARTO Basemap API Key Configuration */}
        <div className="p-4 bg-[#F4FAFD] dark:bg-[#140C14] border border-[#D7E7F0] dark:border-cyan-800/40 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-[#123B6D] dark:text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#1769AA] dark:text-cyan-400" />
                <span>GIS Operations Map &amp; Basemap Tile Configuration</span>
              </span>
              <p className="text-[11px] text-[#55718D] dark:text-slate-400">
                Choose your default basemap layer and manage your CARTO Basemaps API Key.
              </p>
            </div>
            {cartoApiKey ? (
              <span className="px-2 py-0.5 text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-700 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Key Active
              </span>
            ) : (
              <span className="px-2 py-0.5 text-[10px] font-mono bg-amber-950 text-amber-300 border border-amber-700 rounded-full flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Key Optional
              </span>
            )}
          </div>

          {/* Active Provider Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#55718D] dark:text-slate-300">Default Tile Provider</label>
            <select
              value={activeTileProvider}
              onChange={(e) => setTileProvider(e.target.value as TileProvider)}
              className="w-full bg-white dark:bg-[#1A111B] border border-[#D7E7F0] dark:border-[#452D36] rounded-xl px-3 py-2 text-xs text-[#123B6D] dark:text-white focus:outline-none focus:border-[#19B7C9] dark:focus:border-[#F59E0B]"
            >
              <option value="esri_dark">Clean Dark Basemap (Esri Dark Canvas — No Watermarks, No Key Required)</option>
              <option value="carto_dark">CARTO Dark Matter (Requires Free API Key to remove watermark)</option>
              <option value="osm_standard">OpenStreetMap Standard (Light Nautical)</option>
              <option value="esri_satellite">Esri Ocean Satellite Imagery</option>
              <option value="mapbox_dark">Mapbox Dark (Requires Token)</option>
              <option value="mapbox_satellite">Mapbox Satellite (Requires Token)</option>
            </select>
          </div>

          {/* CARTO API Key Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#55718D] dark:text-slate-300 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-[#1769AA] dark:text-cyan-400" />
                <span>CARTO Basemaps API Key</span>
              </label>
              <a
                href="https://carto.com/basemaps/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-[#1769AA] hover:text-[#123B6D] dark:text-cyan-400 dark:hover:text-cyan-300 underline flex items-center gap-1"
              >
                <span>Get Free Key (carto.com)</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <input
              type="text"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="Paste CARTO API key token here..."
              className="w-full bg-white dark:bg-[#1A111B] border border-[#D7E7F0] dark:border-[#452D36] rounded-xl px-3 py-2 text-xs text-[#123B6D] dark:text-white font-mono placeholder:text-slate-400 focus:outline-none focus:border-[#19B7C9] dark:focus:border-[#F59E0B]"
            />
            <p className="text-[10px] text-[#7890A5] dark:text-slate-400">
              CARTO provides a free tier with up to 5,000,000 requests/month without credit card. You can also configure <code className="text-[#1769AA] dark:text-cyan-400">VITE_CARTO_API_KEY</code> in <code className="text-[#1769AA] dark:text-cyan-400">.env</code>.
            </p>
          </div>
        </div>

        {/* Offline Simulator Switch */}
        <div className="p-4 bg-[#F4FAFD] dark:bg-[#140C14] border border-[#D7E7F0] dark:border-[#452D36] rounded-xl flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-[#123B6D] dark:text-white flex items-center gap-2">
              <Wifi className="w-4 h-4 text-[#1769AA] dark:text-cyan-400" />
              <span>Simulate Maritime Disconnected Mode (Offline Testing)</span>
            </span>
            <p className="text-[11px] text-[#55718D] dark:text-slate-400">
              Caches local IndexedDB mutations and simulates satellite link drop.
            </p>
          </div>
          <button
            type="button"
            onClick={toggleSimulatedOffline}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition ${
              isSimulatedOffline ? 'bg-amber-500 text-black' : 'bg-white border border-[#D7E7F0] text-[#123B6D] dark:bg-[#1E1216] dark:border-[#563943] dark:text-slate-300'
            }`}
          >
            {isSimulatedOffline ? 'OFFLINE ACTIVE' : 'ONLINE LINK'}
          </button>
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-gradient-to-r from-[#1769AA] to-[#123B6D] hover:from-[#19B7C9] hover:to-[#1769AA] dark:from-[#D95202] dark:to-[#B8470B] dark:hover:from-[#EA580C] dark:hover:to-[#C2410C] text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition"
        >
          <Save className="w-4 h-4" />
          <span>{t('settings.saveSettings', 'Save Preferences')}</span>
        </button>
      </form>

      <EditProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </div>
  );
};
