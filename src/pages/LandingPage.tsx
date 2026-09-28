import React from 'react';
import {
  AlertOctagon,
  ArrowRight,
  Compass,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/authStore';
import { useSosStore } from '../store/sosStore';
import { SafetyDisclaimer } from '../components/common/SafetyDisclaimer';
import { UserRole } from '../types';

export const LandingPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { switchRole } = useAuthStore();
  const { openTriggerModal } = useSosStore();

  const handleQuickRoleEnter = (role: UserRole) => {
    switchRole(role);
    navigate('/dashboard');
  };

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#F4FAFD] to-[#E8F8FB] border border-[#CFE6EF] p-6 md:p-12 shadow-sm">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-[#19B7C9]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-96 h-96 bg-[#1769AA]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="max-w-3xl space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 bg-[#E8F8FB] text-[#1769AA] border border-[#CFE6EF] rounded-full font-mono text-xs font-bold flex items-center gap-1.5 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-[#19B7C9] animate-ping" />
                {t('landing.platformBadge', 'ORCA MARINE INTELLIGENCE PLATFORM')}
              </span>
              <span className="px-3 py-1 bg-[#EAF8F1] text-[#16845F] border border-[#BFE7D1] rounded-full font-mono text-xs font-bold">
                {t('landing.satelliteBadge', 'INCOIS SATELLITE DERIVED')}
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-[#123B6D] tracking-tight leading-tight">
              {t('landing.heroTitle', 'Ocean Reasoning with')}{' '}
              <span className="text-[#19B7C9]">{t('landing.heroTitleHighlight', 'Collaborative Agents')}</span>
            </h1>

            <p className="text-sm md:text-base text-[#55718D] max-w-2xl leading-relaxed">
              {t('landing.heroDesc', 'A zero-cost, mission-critical marine operations system delivering satellite-derived Potential Fishing Zone (PFZ) advisories, explainable multi-agent field allocation, multilingual AI voice assistance, and agentic SOS emergency SAR coordination.')}
            </p>

            {/* Action CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/dashboard"
                className="px-6 py-3.5 bg-[#1769AA] hover:bg-[#123B6D] text-white font-extrabold text-sm rounded-2xl shadow-sm transition flex items-center gap-2"
              >
                <span>{t('landing.launchDashboard', 'Launch Operations Dashboard')}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/map"
                className="px-6 py-3.5 bg-white hover:bg-[#E8F8FB] text-[#123B6D] font-bold text-sm rounded-2xl border border-[#BFD6E4] transition flex items-center gap-2 shadow-sm"
              >
                <Compass className="w-4 h-4 text-[#1769AA]" />
                <span>{t('landing.interactiveMap', 'Interactive Marine GIS Map')}</span>
              </Link>

              <button
                onClick={openTriggerModal}
                className="px-5 py-3.5 bg-[#E5484D] hover:bg-[#D43D42] text-white font-extrabold text-sm rounded-2xl shadow-md animate-pulse transition flex items-center gap-2"
              >
                <AlertOctagon className="w-4 h-4" />
                <span>{t('landing.emergencySos', 'Emergency SOS')}</span>
              </button>
            </div>
          </div>

          {/* Hero Emblem / Brand Artwork */}
          <div className="hidden lg:flex shrink-0 items-center justify-center p-6 bg-white/80 backdrop-blur-md rounded-3xl border border-[#CFE6EF] shadow-md hover:shadow-xl transition group">
            <img
              src="/orca-logo.png"
              alt="ORCA Logo"
              className="w-64 h-auto max-h-80 object-contain group-hover:scale-105 transition duration-500"
            />
          </div>
        </div>
      </section>

      {/* Safety Notice */}
      <SafetyDisclaimer />

      {/* Role-Based Portals Access Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#123B6D] tracking-tight">{t('landing.directPortals', 'Direct Role Portals & Workbenches')}</h2>
            <p className="text-xs text-[#7890A5]">{t('landing.portalsSubtitle', 'Switch instantly to experience tailored operational interfaces')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            onClick={() => handleQuickRoleEnter('fisherman')}
            className="bg-white rounded-2xl p-5 border border-[#D7E7F0] shadow-sm hover:border-[#19B7C9] hover:shadow-md transition-all space-y-3 cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl">🎣</span>
              <span className="px-2 py-0.5 bg-[#E8F8FB] text-[#1769AA] border border-[#CFE6EF] rounded font-mono text-[10px] font-bold">
                {t('landing.primaryPortal', 'PRIMARY PORTAL')}
              </span>
            </div>
            <h3 className="text-base font-bold text-[#123B6D]">{t('dashboards.fishermanTitle', 'Fisherman Maritime Operations Center')}</h3>
            <p className="text-xs text-[#55718D] leading-relaxed">
              {t('fisherman.centerSubtitle', 'Simplified compass bearings, voice-ready advisories, wave safety forecasts, and rapid SOS dispatch for skippers.')}
            </p>
            <span className="text-xs font-semibold text-[#1769AA] flex items-center gap-1 pt-1">
              {t('landing.enterDeck', 'Enter Deck →')}
            </span>
          </div>

          <div
            onClick={() => handleQuickRoleEnter('disaster_authority')}
            className="bg-white rounded-2xl p-5 border border-[#D7E7F0] shadow-sm hover:border-[#E5484D] hover:shadow-md transition-all space-y-3 cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl">🚨</span>
              <span className="px-2 py-0.5 bg-[#FFF0F1] text-[#E5484D] border border-[#FCDAD7] rounded font-mono text-[10px] font-bold">
                INCIDENT COMMAND
              </span>
            </div>
            <h3 className="text-base font-bold text-[#123B6D]">Disaster Authority & SAR Command</h3>
            <p className="text-xs text-[#55718D] leading-relaxed">
              Real-time SOS triage feed, Indian Coast Guard SAR case liaison, search radius tracking, and emergency broadcasting.
            </p>
            <span className="text-xs font-semibold text-[#E5484D] flex items-center gap-1 pt-1">
              Open SAR Command →
            </span>
          </div>

          <div
            onClick={() => handleQuickRoleEnter('researcher')}
            className="bg-white rounded-2xl p-5 border border-[#D7E7F0] shadow-sm hover:border-[#19B7C9] hover:shadow-md transition-all space-y-3 cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl">🔬</span>
              <span className="px-2 py-0.5 bg-[#E8F8FB] text-[#1769AA] border border-[#CFE6EF] rounded font-mono text-[10px] font-bold">
                OCEANOGRAPHY
              </span>
            </div>
            <h3 className="text-base font-bold text-[#123B6D]">Marine Research & Intelligence</h3>
            <p className="text-xs text-[#55718D] leading-relaxed">
              SST isotherms, chlorophyll plume correlations, bathymetric depth profiles, and GeoJSON dataset exports.
            </p>
            <span className="text-xs font-semibold text-[#1769AA] flex items-center gap-1 pt-1">
              Open Research Grid →
            </span>
          </div>

          <div
            onClick={() => handleQuickRoleEnter('agent')}
            className="bg-white rounded-2xl p-5 border border-[#D7E7F0] shadow-sm hover:border-[#19B7C9] hover:shadow-md transition-all space-y-3 cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl">📱</span>
              <span className="px-2 py-0.5 bg-[#F4FAFD] text-[#55718D] border border-[#D7E7F0] rounded font-mono text-[10px] font-bold">
                OFFLINE CAPABLE
              </span>
            </div>
            <h3 className="text-base font-bold text-[#123B6D]">Field Extension Agent Deck</h3>
            <p className="text-xs text-[#55718D] leading-relaxed">
              Disconnected task queue, GPS check-ins, photo attachments, and local harbour briefings.
            </p>
            <span className="text-xs font-semibold text-[#1769AA] flex items-center gap-1 pt-1">
              Open Field Deck →
            </span>
          </div>

          <div
            onClick={() => handleQuickRoleEnter('supervisor')}
            className="bg-white rounded-2xl p-5 border border-[#D7E7F0] shadow-sm hover:border-[#19B7C9] hover:shadow-md transition-all space-y-3 cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl">👔</span>
              <span className="px-2 py-0.5 bg-[#E8F8FB] text-[#1769AA] border border-[#CFE6EF] rounded font-mono text-[10px] font-bold">
                AI DISPATCH
              </span>
            </div>
            <h3 className="text-base font-bold text-[#123B6D]">Supervisor Allocation Cockpit</h3>
            <p className="text-xs text-[#55718D] leading-relaxed">
              Autonomous multi-criteria matching engine with natural language explainability and manual override controls.
            </p>
            <span className="text-xs font-semibold text-[#1769AA] flex items-center gap-1 pt-1">
              Open Allocation Cockpit →
            </span>
          </div>

          <div
            onClick={() => handleQuickRoleEnter('admin')}
            className="bg-white rounded-2xl p-5 border border-[#D7E7F0] shadow-sm hover:border-[#19B7C9] hover:shadow-md transition-all space-y-3 cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl">🛡️</span>
              <span className="px-2 py-0.5 bg-[#EAF8F1] text-[#16845F] border border-[#BFE7D1] rounded font-mono text-[10px] font-bold">
                RBAC & AUDIT
              </span>
            </div>
            <h3 className="text-base font-bold text-[#123B6D]">Administrator & Governance</h3>
            <p className="text-xs text-[#55718D] leading-relaxed">
              System health monitoring, GIS remote-sensing data sources, and immutable audit logs.
            </p>
            <span className="text-xs font-semibold text-[#1769AA] flex items-center gap-1 pt-1">
              Open Admin Console →
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};
