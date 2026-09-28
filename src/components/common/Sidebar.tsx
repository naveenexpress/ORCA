import React, { useState } from 'react';
import {
  LayoutDashboard,
  Map,
  Fish,
  Users2,
  UserSquare2,
  User,
  CheckSquare,
  FolderKanban,
  AlertOctagon,
  MessageSquare,
  Bell,
  BarChart3,
  Layers,
  Database,
  Shield,
  History,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Radio,
  Compass,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useSosStore } from '../../store/sosStore';
import { useCaseStore } from '../../store/caseStore';
import { useTranslation } from 'react-i18next';

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  badgeColor?: string;
  roles?: string[];
}

export const Sidebar: React.FC = () => {
  const { t } = useTranslation();
  const { activeRole } = useAuthStore();
  const { incidents } = useSosStore();
  const { cases } = useCaseStore();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const activeSosCount = incidents.filter(
    (i) => i.status === 'responding' || i.status === 'assigned' || i.status === 'received'
  ).length;
  const openCasesCount = cases.filter((c) => c.status !== 'closed' && c.status !== 'resolved').length;

  const NAV_ITEMS: NavItem[] = [
    { label: t('nav.dashboard', 'Dashboard'), path: '/dashboard', icon: LayoutDashboard }, // all
    { label: t('nav.map', 'Marine GIS Map'), path: '/map', icon: Map }, // all
    { label: t('nav.pfz', 'PFZ Advisories'), path: '/pfz', icon: Fish, roles: ['fisherman', 'agent', 'supervisor', 'researcher', 'analyst', 'admin'] },
    { label: t('nav.voyagePlanner', 'Voyage Planner'), path: '/voyage-planner', icon: Compass, roles: ['fisherman', 'admin'] },
    {
      label: t('nav.sos', 'Emergency SOS'),
      path: '/sos',
      icon: AlertOctagon,
      badge: activeSosCount > 0 ? activeSosCount : undefined,
      badgeColor: 'bg-red-500 text-white',
      roles: ['fisherman', 'agent', 'supervisor', 'disaster_authority', 'admin']
    },
    { label: t('nav.safetyMonitor', 'Safety Monitor'), path: '/safety-monitor', icon: Shield, roles: ['supervisor', 'disaster_authority', 'admin'] },
    { label: t('nav.chat', 'ORCA Assistant'), path: '/chat', icon: MessageSquare, roles: ['fisherman', 'agent', 'admin'] },
    { label: t('nav.allocation', 'Agent Allocation'), path: '/allocation', icon: Users2, roles: ['supervisor', 'admin'] },
    { label: t('nav.agents', 'Field Agents'), path: '/agents', icon: UserSquare2, roles: ['supervisor', 'admin'] },
    {
      label: t('nav.cases', 'Cases & Requests'),
      path: '/cases',
      icon: FolderKanban,
      badge: openCasesCount > 0 ? openCasesCount : undefined,
      badgeColor: 'bg-cyan-500 text-black',
      roles: ['agent', 'supervisor', 'disaster_authority', 'admin']
    },
    { label: t('nav.tasks', 'Field Tasks'), path: '/tasks', icon: CheckSquare, roles: ['fisherman', 'agent', 'supervisor', 'admin'] },
    { label: t('nav.notifications', 'Notifications'), path: '/notifications', icon: Bell }, // all
    { label: t('nav.reports', 'Reports & Analytics'), path: '/reports', icon: BarChart3, roles: ['supervisor', 'researcher', 'analyst', 'disaster_authority', 'admin'] },
    { label: t('nav.zones', 'Operational Zones'), path: '/zones', icon: Layers, roles: ['supervisor', 'researcher', 'analyst', 'disaster_authority', 'admin'] },
    { label: t('nav.dataSources', 'Data Sources'), path: '/data-sources', icon: Database, roles: ['researcher', 'analyst', 'admin'] },
    { label: t('nav.users', 'User RBAC'), path: '/users', icon: Shield, roles: ['admin'] },
    { label: t('nav.auditLogs', 'Audit Logs'), path: '/audit-logs', icon: History, roles: ['admin'] },
    { label: t('nav.profile', 'Operator Profile'), path: '/profile', icon: User }, // all
    { label: t('nav.settings', 'Settings'), path: '/settings', icon: Settings }, // all
    { label: t('nav.help', 'Help & Docs'), path: '/help', icon: HelpCircle }, // all
  ];

  return (
    <aside
      className={`hidden lg:flex flex-col bg-white border-r border-[#D7E7F0] transition-all duration-300 relative select-none z-30 h-full max-h-full shrink-0 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Collapse Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-5 w-6 h-6 rounded-full bg-white border border-[#D7E7F0] text-[#55718D] hover:text-[#123B6D] flex items-center justify-center shadow-md transition z-40"
        aria-label="Toggle Sidebar"
      >
        {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>

      {/* Navigation Links Scroll Container */}
      <div className="flex-1 py-4 px-3 overflow-y-auto space-y-1">
        {!isCollapsed && (
          <div className="px-3 pb-2 text-[10px] font-mono uppercase tracking-wider text-[#7890A5] font-bold">
            {t('nav.marineOperations', 'Marine Operations')}
          </div>
        )}

        {NAV_ITEMS.filter((item) => !item.roles || item.roles.includes(activeRole || 'fisherman')).map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition group ${
                  isActive
                    ? 'bg-[#E8F8FB] text-[#123B6D] border-l-4 border-l-[#19B7C9] border-y border-r border-[#D7E7F0] font-bold'
                    : 'text-[#55718D] hover:text-[#123B6D] hover:bg-[#E8F8FB]'
                }`
              }
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className="w-4 h-4 shrink-0 text-[#1769AA] group-hover:scale-110 transition" />
              {!isCollapsed && <span className="truncate flex-1">{item.label}</span>}
              {!isCollapsed && item.badge && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold font-mono ${item.badgeColor || 'bg-[#E8F8FB] text-[#1769AA]'}`}>
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Footer Telemetry Widget in Sidebar */}
      {!isCollapsed ? (
        <div className="p-3.5 m-3 bg-[#F4FAFD] border border-[#D7E7F0] rounded-2xl space-y-2 text-xs">
          <div className="flex items-center justify-between text-[#55718D]">
            <span className="flex items-center gap-1.5 font-mono text-[11px] text-[#24A978] font-bold">
              <span className="w-2 h-2 rounded-full bg-[#24A978] animate-ping" />
              {t('sidebar.gridOnline', 'INCOIS Grid Online')}
            </span>
            <span className="text-[10px] font-mono text-[#7890A5]">Oceansat-3</span>
          </div>
          <div className="text-[11px] text-[#55718D] leading-tight">
            {t('sidebar.role', 'Role:')} <strong className="text-[#123B6D] capitalize">{t(`roles.${activeRole}`, activeRole?.replace('_', ' ') || '')}</strong>
          </div>
          <a
            href="https://incois.gov.in"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between pt-1 text-[10px] text-[#1769AA] hover:text-[#123B6D] hover:underline font-medium"
          >
            <span>{t('sidebar.advisoryPortal', 'INCOIS Advisory Portal')}</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      ) : (
        <div className="p-3 flex justify-center text-[#24A978]">
          <Radio className="w-4 h-4 animate-pulse" />
        </div>
      )}
    </aside>
  );
};
