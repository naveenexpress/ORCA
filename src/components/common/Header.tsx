import React, { useState, useRef } from 'react';
import {
  Globe,
  Bell,
  AlertOctagon,
  Wifi,
  WifiOff,
  ChevronDown,
  Search,
  CheckCircle2,
  Menu,
  Camera,
  Upload,
  User as UserIcon,
  LogOut,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/authStore';
import { useNotifStore } from '../../store/notifStore';
import { useSosStore } from '../../store/sosStore';
import { useOfflineStore } from '../../store/offlineStore';
import { UserRole, LanguageCode } from '../../types';
import { EditProfileModal } from './EditProfileModal';
import { ThemeToggle } from './ThemeToggle';

const ROLE_OPTIONS: { role: UserRole; label: string; icon: string; desc: string }[] = [
  { role: 'fisherman', label: 'Fisherman / Public', icon: '🎣', desc: 'Primary advisory, compass bearings & SOS' },
  { role: 'disaster_authority', label: 'Disaster Authority (SDMA/SAR)', icon: '🚨', desc: 'Incident command & SAR dispatch' },
  { role: 'researcher', label: 'Marine Scientist / NIOT', icon: '🔬', desc: 'SST, chlorophyll & oceanographic research' },
  { role: 'agent', label: 'Field Extension Agent', icon: '📱', desc: 'Offline tasks, GPS tracking & cases' },
  { role: 'supervisor', label: 'Operations Supervisor', icon: '👔', desc: 'Workload balancing & AI auto-allocation' },
  { role: 'admin', label: 'System Administrator', icon: '🛡️', desc: 'Health, RBAC permissions & GIS sources' },
  { role: 'analyst', label: 'Marine Spatial Analyst', icon: '📊', desc: 'Fishery trends & intelligence reports' },
];

const LANGUAGE_OPTIONS: { code: LanguageCode; label: string; native: string }[] = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'hi', label: 'Hindi', native: 'हिंदी' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు' },
  { code: 'ml', label: 'Malayalam', native: 'മലയാളം' },
  { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'bn', label: 'Bengali', native: 'বাংলা' },
];

interface HeaderProps {
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentUser, activeRole, switchRole, language, setLanguage, updateUserProfile, logout } = useAuthStore();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifStore();
  const { openTriggerModal } = useSosStore();
  const { isSimulatedOffline, toggleSimulatedOffline } = useOfflineStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isNotifMenuOpen, setIsNotifMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [photoUploadNotice, setPhotoUploadNotice] = useState(false);

  const handleDirectPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          updateUserProfile({ avatar: reader.result });
          setPhotoUploadNotice(true);
          setTimeout(() => setPhotoUploadNotice(false), 4000);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <header className="sticky top-0 z-40 h-16 shrink-0 bg-white border-b border-[#D7E7F0] backdrop-blur-md px-4 lg:px-6 flex items-center justify-between gap-3 select-none shadow-sm">
      {/* Left: Brand + Hamburger */}
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="p-2 text-[#55718D] hover:text-[#123B6D] rounded-lg hover:bg-[#E8F8FB] lg:hidden"
            aria-label="Toggle Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="relative w-10 h-10 rounded-xl bg-white border border-[#D7E7F0] p-1 flex items-center justify-center shadow-sm group-hover:border-[#19B7C9] transition">
            <img
              src="/orca-symbol.png"
              alt="ORCA Logo"
              className="w-full h-full object-contain group-hover:scale-110 transition duration-300"
            />
          </div>

          <div className="hidden sm:block">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold tracking-wider text-[#123B6D] text-lg font-mono">ORCA</span>
              <span className="px-1.5 py-0.2 bg-[#E8F8FB] border border-[#CFE6EF] rounded text-[10px] font-mono text-[#1769AA] font-bold">
                v2.4
              </span>
            </div>
            <p className="text-[10px] text-[#55718D] font-mono leading-none tracking-tight">
              {t('header.brandSubtitle', 'Ocean Reasoning Platform')}
            </p>
          </div>
        </Link>
      </div>

      {/* Middle: Search */}
      <div className="hidden md:flex items-center flex-1 max-w-xs lg:max-w-md mx-2">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-[#1769AA] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder={t('header.search', 'Search PFZ, landing centres, vessels, agents...')}
            className="w-full bg-[#F4FAFD] border border-[#D7E7F0] text-[#123B6D] placeholder-[#7890A5] rounded-xl pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:border-[#19B7C9] focus:ring-2 focus:ring-[#19B7C9]/20 transition"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 lg:gap-3">
        {/* Offline Simulator Switch */}
        <button
          onClick={toggleSimulatedOffline}
          className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-mono transition ${
            isSimulatedOffline
              ? 'bg-[#FFF7E3] border-[#F0D98C] text-[#E7A928] font-bold'
              : 'bg-[#EAF8F1] border-[#BFE7D1] text-[#16845F] font-bold'
          }`}
          title="Toggle Simulated Marine Cellular / Satellite Offline Mode"
        >
          {isSimulatedOffline ? <WifiOff className="w-3.5 h-3.5 text-[#E7A928]" /> : <Wifi className="w-3.5 h-3.5 text-[#16845F]" />}
          <span className="hidden xl:inline">{isSimulatedOffline ? t('header.offlineSim', 'OFFLINE SIM') : t('header.satLinkOn', 'SAT LINK ON')}</span>
        </button>

        {/* Demo Role Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setIsRoleMenuOpen(!isRoleMenuOpen);
              setIsLangMenuOpen(false);
              setIsNotifMenuOpen(false);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#F4FAFD] hover:bg-[#E8F8FB] border border-[#D7E7F0] rounded-xl text-xs font-medium text-[#123B6D] transition"
          >
            <span className="text-sm">
              {ROLE_OPTIONS.find((r) => r.role === activeRole)?.icon || '👤'}
            </span>
            <span className="hidden sm:inline capitalize font-semibold">
              {t(`roles.${activeRole}`, activeRole.replace('_', ' '))}
            </span>
            <span className="px-1.5 py-0.5 bg-[#E8F8FB] border border-[#CFE6EF] rounded text-[9px] font-mono text-[#1769AA] font-bold">
              {t('header.demoRole', 'DEMO ROLE')}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-[#55718D]" />
          </button>

          {isRoleMenuOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white border border-[#D7E7F0] rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-3 py-1.5 border-b border-[#D7E7F0] flex items-center justify-between text-xs text-[#55718D]">
                <span className="font-semibold text-[#123B6D]">{t('header.switchRole', 'Switch Demo Role')}</span>
                <span className="font-mono text-[10px] text-[#1769AA] font-bold">{t('header.instantSwitch', 'Instant Switch')}</span>
              </div>
              <div className="py-1 max-h-80 overflow-y-auto">
                {ROLE_OPTIONS.map((item) => (
                  <button
                    key={item.role}
                    onClick={() => {
                      switchRole(item.role);
                      setIsRoleMenuOpen(false);
                      navigate('/dashboard');
                    }}
                    className={`w-full px-3 py-2 text-left flex items-start gap-2.5 hover:bg-[#E8F8FB] transition ${
                      activeRole === item.role ? 'bg-[#E8F8FB] border-l-4 border-[#19B7C9]' : ''
                    }`}
                  >
                    <span className="text-lg shrink-0 mt-0.5">{item.icon}</span>
                    <div className="min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#123B6D]">{t(`roles.${item.role}`, item.label)}</span>
                        {activeRole === item.role && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#19B7C9]" />
                        )}
                      </div>
                      <p className="text-[11px] text-[#55718D] leading-tight">{item.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Multilingual Selector */}
        <div className="relative">
          <button
            onClick={() => {
              setIsLangMenuOpen(!isLangMenuOpen);
              setIsRoleMenuOpen(false);
              setIsNotifMenuOpen(false);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#F4FAFD] hover:bg-[#E8F8FB] border border-[#D7E7F0] rounded-xl text-xs text-[#123B6D] transition"
            title="Select Language (GIGW Compliant Indian Languages)"
          >
            <Globe className="w-3.5 h-3.5 text-[#1769AA]" />
            <span className="font-mono uppercase font-bold">{language}</span>
            <ChevronDown className="w-3 h-3 text-[#55718D]" />
          </button>

          {isLangMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-[#D7E7F0] rounded-xl shadow-xl py-1 z-50 animate-in fade-in">
              <div className="px-3 py-1 border-b border-[#D7E7F0] text-[11px] font-semibold text-[#55718D] font-mono">
                {t('header.indianLanguages', 'Indian Languages (Unicode)')}
              </div>
              {LANGUAGE_OPTIONS.map((l) => (
                <button
                  key={l.code}
                  onClick={() => {
                    setLanguage(l.code);
                    setIsLangMenuOpen(false);
                  }}
                  className={`w-full px-3 py-1.5 text-left text-xs flex items-center justify-between hover:bg-[#E8F8FB] transition ${
                    language === l.code ? 'text-[#1769AA] font-bold bg-[#E8F8FB]' : 'text-[#55718D]'
                  }`}
                >
                  <span>{l.native}</span>
                  <span className="text-[11px] font-mono text-[#7890A5]">{l.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Global Light / Dark Mode Toggle */}
        <ThemeToggle />

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setIsNotifMenuOpen(!isNotifMenuOpen);
              setIsRoleMenuOpen(false);
              setIsLangMenuOpen(false);
            }}
            className="relative p-2 bg-[#F4FAFD] hover:bg-[#E8F8FB] border border-[#D7E7F0] rounded-xl text-[#1769AA] hover:text-[#123B6D] transition"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#E5484D] text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {isNotifMenuOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-[#D7E7F0] rounded-2xl shadow-xl z-50 animate-in fade-in">
              <div className="p-3 border-b border-[#D7E7F0] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-[#1769AA]" />
                  <span className="text-xs font-bold text-[#123B6D]">{t('header.notifications', 'Notifications & Alerts')}</span>
                  <span className="px-1.5 py-0.5 bg-[#FFF0F1] text-[#E5484D] border border-[#FFD5D8] rounded text-[10px] font-mono font-bold">
                    {unreadCount} {t('header.unread', 'Unread')}
                  </span>
                </div>
                <button
                  onClick={markAllAsRead}
                  className="text-[11px] text-[#1769AA] hover:underline font-medium"
                >
                  {t('header.markAllRead', 'Mark all read')}
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-[#D7E7F0]">
                {notifications.slice(0, 5).map((n) => (
                  <div
                    key={n.id}
                    onClick={() => markAsRead(n.id)}
                    className={`p-3 text-xs cursor-pointer hover:bg-[#E8F8FB] transition ${
                      !n.isRead ? 'bg-[#F4FAFD]' : 'opacity-70'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-[#123B6D]">{n.title}</p>
                      <span className="text-[10px] font-mono text-[#7890A5] shrink-0">
                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#55718D] mt-1 line-clamp-2">{n.message}</p>
                  </div>
                ))}
              </div>

              <div className="p-2.5 border-t border-[#D7E7F0] text-center bg-[#F4FAFD]">
                <Link
                  to="/notifications"
                  onClick={() => setIsNotifMenuOpen(false)}
                  className="text-xs font-semibold text-[#1769AA] hover:text-[#123B6D]"
                >
                  {t('header.viewAllNotifications', 'View All Notifications →')}
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Prominent Emergency SOS Button */}
        <button
          onClick={openTriggerModal}
          className="flex items-center gap-2 px-3.5 py-1.5 bg-[#E5484D] hover:bg-[#C5353A] text-white font-extrabold text-xs tracking-wider rounded-xl shadow-md transition"
        >
          <AlertOctagon className="w-4 h-4 text-white" />
          <span>{t('sos.triggerButton', 'EMERGENCY SOS')}</span>
        </button>

        {/* User Profile Avatar with Direct Photo Upload Option */}
        <div className="relative flex items-center gap-1.5 pl-2 border-l border-[#D7E7F0] dark:border-[#452D36]">
          {/* Direct Camera Upload Trigger */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-2.5 py-1.5 rounded-lg text-[#123B6D] hover:text-[#1769AA] bg-[#F4FAFD] hover:bg-[#E8F8FB] border border-[#D7E7F0] dark:text-[#F59E0B] dark:hover:text-[#FFF6EE] dark:bg-[#1E1216] dark:hover:bg-[#281B22] dark:border-[#C05615]/70 dark:hover:border-[#F59E0B] transition flex items-center gap-1.5 shadow-sm"
            title={t('header.uploadPhoto', 'Upload Photo')}
            aria-label="Upload Photo"
          >
            <Camera className="w-3.5 h-3.5 text-[#1769AA] dark:text-[#F59E0B]" />
            <span className="text-[11px] font-bold tracking-tight">{t('header.uploadPhoto', 'Upload Photo')}</span>
          </button>

          {/* Hidden File Input for Instant Device Photo Selection */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleDirectPhotoUpload}
            className="hidden"
          />

          {/* Interactive Profile Avatar */}
          <button
            type="button"
            onClick={() => {
              setIsProfileMenuOpen(!isProfileMenuOpen);
              setIsRoleMenuOpen(false);
              setIsLangMenuOpen(false);
              setIsNotifMenuOpen(false);
            }}
            className="relative group p-0.5 rounded-full hover:ring-2 hover:ring-[#19B7C9] dark:hover:ring-[#F59E0B] transition"
            title={`${currentUser.name} (${t(`roles.${currentUser.role}`, currentUser.role.replace('_', ' '))})`}
            aria-label="Profile Menu"
          >
            <img
              src={currentUser.avatar && !currentUser.avatar.includes('photo-1534528741775') && !currentUser.avatar.includes('photo-1544717305') ? currentUser.avatar : '/murugan-avatar.jpg'}
              alt={currentUser.name}
              className="w-8 h-8 rounded-full border border-[#19B7C9]/60 dark:border-[#F59E0B]/70 object-cover group-hover:scale-105 transition shadow-sm"
            />
            {/* Camera badge */}
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-[#1769AA] dark:bg-[#C05615] rounded-full border border-white dark:border-[#140C14] flex items-center justify-center text-white transition shadow">
              <Camera className="w-2 h-2" />
            </div>
          </button>

          {/* Profile Popover Menu */}
          {isProfileMenuOpen && (
            <div className="absolute right-0 top-12 mt-2 w-72 bg-white border border-[#D7E7F0] dark:bg-[#24181E] dark:border-[#452D36] rounded-2xl shadow-2xl py-3 px-4 z-50 animate-in fade-in slide-in-from-top-2 text-[#123B6D] dark:text-[#FFF6EE]">
              <div className="flex items-center gap-3 pb-3 border-b border-[#D7E7F0] dark:border-[#452D36]">
                <div
                  className="relative group cursor-pointer shrink-0"
                  onClick={() => fileInputRef.current?.click()}
                  title={t('header.uploadPhoto', 'Upload Photo')}
                >
                  <img
                    src={currentUser.avatar && !currentUser.avatar.includes('photo-1534528741775') && !currentUser.avatar.includes('photo-1544717305') ? currentUser.avatar : '/murugan-avatar.jpg'}
                    alt={currentUser.name}
                    className="w-12 h-12 rounded-full border-2 border-[#19B7C9] dark:border-[#F59E0B] object-cover"
                  />
                  <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-white">
                    <Camera className="w-4 h-4" />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-[#123B6D] dark:text-[#FFF6EE] truncate">{currentUser.name}</h4>
                  <p className="text-[10px] text-[#55718D] dark:text-[#D4C2B6] truncate">{currentUser.email}</p>
                  <span className="inline-block mt-0.5 px-2 py-0.5 text-[9px] font-mono bg-[#EAF8F1] text-[#16845F] border border-[#BFE7D1] dark:bg-[#0C5240] dark:text-[#10B981] dark:border-[#047857] rounded-full font-bold">
                    {t(`roles.${currentUser.role}`, currentUser.role.replace('_', ' ').toUpperCase())}
                  </span>
                </div>
              </div>

              {photoUploadNotice && (
                <div className="my-2 p-2 bg-[#EAF8F1] border border-[#BFE7D1] text-[#16845F] dark:bg-[#0C5240] dark:border-[#047857] dark:text-[#10B981] text-[11px] rounded-lg text-center font-bold animate-in fade-in">
                  {t('header.photoUpdated', '✓ Photo updated successfully!')}
                </div>
              )}

              <div className="py-2 space-y-1.5">
                {/* 1-Click Upload Photo Button */}
                <button
                  type="button"
                  onClick={() => {
                    fileInputRef.current?.click();
                    setIsProfileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-[#1769AA] to-[#123B6D] hover:from-[#19B7C9] hover:to-[#1769AA] dark:from-[#D95202] dark:to-[#B8470B] dark:hover:from-[#EA580C] dark:hover:to-[#C2410C] text-white text-xs font-bold rounded-xl shadow-md transition"
                >
                  <Upload className="w-4 h-4" />
                  <span>{t('header.uploadFromDevice', 'Upload Photo from Device')}</span>
                </button>

                {/* Direct Link to Full Profile Page */}
                <Link
                  to="/profile"
                  onClick={() => setIsProfileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-[#F4FAFD] hover:bg-[#E8F8FB] text-[#123B6D] border border-[#D7E7F0] dark:bg-[#1E1216] dark:hover:bg-[#281B22] dark:text-[#FFF6EE] dark:border-[#C05615]/70 text-xs font-bold rounded-xl transition shadow-sm"
                >
                  <UserIcon className="w-4 h-4 text-[#1769AA] dark:text-[#F59E0B]" />
                  <span>{t('header.operatorProfilePage', 'Operator Profile Page')}</span>
                </Link>

                {/* Edit Profile Details Modal Button */}
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    setIsProfileModalOpen(true);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-3 py-1.5 text-[11px] text-[#55718D] dark:text-[#D4C2B6] hover:text-[#123B6D] dark:hover:text-[#FFF6EE] hover:underline transition"
                >
                  <span>{t('header.quickEdit', 'Open Quick Edit Modal')}</span>
                </button>

                {/* Sign Out Button */}
                <button
                  type="button"
                  onClick={async () => {
                    setIsProfileMenuOpen(false);
                    await logout();
                    navigate('/login');
                  }}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 dark:bg-red-950/40 dark:hover:bg-red-900/40 dark:text-red-300 text-xs font-bold rounded-xl transition shadow-sm border border-red-200 dark:border-red-900/50 mt-1"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{t('common.logout', 'Sign Out')}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Global Edit Profile Modal */}
      <EditProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </header>
  );
};
