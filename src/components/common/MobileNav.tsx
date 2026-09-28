import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Map, Fish, AlertOctagon, MessageSquare } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSosStore } from '../../store/sosStore';

export const MobileNav: React.FC = () => {
  const { t } = useTranslation();
  const { openTriggerModal } = useSosStore();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 h-16 bg-white/95 border-t border-[#D7E7F0] backdrop-blur-lg px-2 flex items-center justify-around select-none shadow-md">
      <NavLink
        to="/dashboard"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center w-14 h-full text-[10px] font-medium transition ${
            isActive ? 'text-[#1769AA] font-bold' : 'text-[#55718D] hover:text-[#123B6D]'
          }`
        }
      >
        <LayoutDashboard className="w-5 h-5 mb-0.5" />
        <span>{t('nav.dashboard', 'Dashboard')}</span>
      </NavLink>

      <NavLink
        to="/map"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center w-14 h-full text-[10px] font-medium transition ${
            isActive ? 'text-[#1769AA] font-bold' : 'text-[#55718D] hover:text-[#123B6D]'
          }`
        }
      >
        <Map className="w-5 h-5 mb-0.5" />
        <span>{t('nav.map', 'Map')}</span>
      </NavLink>

      {/* Floating Center SOS Button */}
      <button
        onClick={openTriggerModal}
        className="-mt-5 w-13 h-13 rounded-full bg-[#E5484D] hover:bg-[#C5353A] text-white shadow-md flex flex-col items-center justify-center border-2 border-white transition"
        aria-label="Emergency SOS"
      >
        <AlertOctagon className="w-5 h-5" />
        <span className="text-[9px] font-extrabold tracking-tight">{t('sos.triggerButton', 'SOS')}</span>
      </button>

      <NavLink
        to="/pfz"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center w-14 h-full text-[10px] font-medium transition ${
            isActive ? 'text-[#1769AA] font-bold' : 'text-[#55718D] hover:text-[#123B6D]'
          }`
        }
      >
        <Fish className="w-5 h-5 mb-0.5" />
        <span>{t('nav.pfz', 'PFZ')}</span>
      </NavLink>

      <NavLink
        to="/chat"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center w-14 h-full text-[10px] font-medium transition ${
            isActive ? 'text-[#1769AA] font-bold' : 'text-[#55718D] hover:text-[#123B6D]'
          }`
        }
      >
        <MessageSquare className="w-5 h-5 mb-0.5" />
        <span>{t('nav.chat', 'Chat')}</span>
      </NavLink>
    </nav>
  );
};
