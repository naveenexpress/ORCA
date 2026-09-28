import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/authStore';
import { useUserStore } from '../store/userStore';
import {
  Shield,
  Mail,
  Phone,
  Loader2,
  AlertCircle,
} from 'lucide-react';

export const UsersPage: React.FC = () => {
  const { t } = useTranslation();
  const { switchRole, activeRole } = useAuthStore();
  const { users, isLoading, error } = useUserStore();

  return (
    <div className="space-y-6 pb-12">
      {/* ── Header ── exact clone of original ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-marine-900 via-marine-850 to-cyan-950/40 p-5 rounded-2xl border border-marine-750 shadow-hud">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-cyan-950 text-cyan-300 border border-cyan-800 rounded font-mono text-xs font-bold flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-cyan-400" />
              {t('nav.users', 'User RBAC')}
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            {t('usersPage.title', 'Role-Based Access Control Governance')}
          </h1>
          <p className="text-xs text-slate-300">
            {t('usersPage.subtitle', '7 Demo accounts configured for instant role-switching and permission audit.')}
          </p>
        </div>
      </div>

      {/* ── Error banner (non-fatal – seed data shown below) ── */}
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 bg-red-950/40 border border-red-800/60 rounded-xl text-red-300 text-xs font-mono">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ── User cards grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Loading skeleton – mimics card size while data arrives */}
        {isLoading && users.length === 0
          ? Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                className="marine-card rounded-2xl p-5 border border-marine-750 space-y-4 animate-pulse"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-marine-800" />
                  <div className="space-y-2 flex-1">
                    <div className="h-3 bg-marine-800 rounded w-3/4" />
                    <div className="h-2 bg-marine-800 rounded w-1/2" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-2 bg-marine-800 rounded w-full" />
                  <div className="h-2 bg-marine-800 rounded w-2/3" />
                </div>
                <div className="pt-2 border-t border-marine-800">
                  <div className="h-8 bg-marine-800 rounded-xl w-full" />
                </div>
              </div>
            ))
          : users.map((usr) => {
              const isActive = activeRole === usr.role;
              return (
                <div
                  key={usr.id}
                  className={`marine-card rounded-2xl p-5 border space-y-4 transition ${
                    isActive ? 'border-cyan-400 shadow-glow-cyan bg-cyan-950/20' : 'border-marine-750'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={usr.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(usr.name)}&size=96&background=0e4f6b&color=ffffff`}
                      alt={usr.name}
                      className="w-12 h-12 rounded-xl object-cover border border-cyan-500/50"
                    />
                    <div>
                      <h3 className="font-bold text-white text-sm">{usr.name}</h3>
                      <p className="text-xs text-cyan-300 font-mono capitalize">{usr.role.replace('_', ' ')}</p>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-300 font-mono">
                    <p className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{usr.email}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{usr.phone || '—'}</span>
                    </p>
                  </div>

                  <div className="pt-2 border-t border-marine-800">
                    <button
                      onClick={() => switchRole(usr.role)}
                      className={`w-full py-2 rounded-xl text-xs font-bold transition ${
                        isActive
                          ? 'bg-cyan-500 text-black shadow-glow-cyan'
                          : 'bg-marine-800 hover:bg-marine-750 text-slate-200'
                      }`}
                    >
                      {isActive ? 'Active Demo Session' : 'Switch to this Account'}
                    </button>
                  </div>
                </div>
              );
            })}

        {/* Inline spinner overlaid when refreshing while data is already shown */}
        {isLoading && users.length > 0 && (
          <div className="col-span-full flex items-center justify-center gap-2 text-cyan-400 text-xs font-mono py-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Syncing with database…</span>
          </div>
        )}
      </div>
    </div>
  );
};
