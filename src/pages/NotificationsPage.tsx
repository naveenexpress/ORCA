import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useNotifStore } from '../store/notifStore';
import {
  Bell,
  AlertOctagon,
  Fish,
  FolderKanban,
  Loader2,
  AlertCircle,
} from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, markAllAsRead, isLoading, error } = useNotifStore();

  const handleNotificationClick = (n: any) => {
    markAsRead(n.id);
    if (n.relatedRecordType === 'pfz' && n.relatedRecordId) {
      navigate(`/pfz/${n.relatedRecordId}`);
    } else if (n.relatedRecordType === 'sos' && n.relatedRecordId) {
      navigate(`/sos/${n.relatedRecordId}`);
    } else if (n.relatedRecordType === 'case' && n.relatedRecordId) {
      navigate(`/cases/${n.relatedRecordId}`);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-marine-900 via-marine-850 to-cyan-950/40 p-5 rounded-2xl border border-marine-750 shadow-hud">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-cyan-950 text-cyan-300 border border-cyan-800 rounded font-mono text-xs font-bold flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 text-cyan-400" />
              {t('nav.notifications', 'Notifications')}
            </span>
            <span className="text-xs text-red-400 font-mono">{unreadCount} {t('notificationsPage.unread', 'Unread Alerts')}</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            {t('notificationsPage.title', 'Notifications & Broadcasts')}
          </h1>
          <p className="text-xs text-slate-300">
            {t('notificationsPage.subtitle', 'Real-time advisory updates, case assignments, SOS alerts, and satellite ingest telemetry.')}
          </p>
        </div>

        <button
          onClick={markAllAsRead}
          className="px-4 py-2 bg-marine-800 hover:bg-marine-750 text-cyan-300 font-bold text-xs rounded-xl border border-marine-700 transition"
        >
          {t('notificationsPage.markAllRead', 'Mark All As Read')}
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
          <span>{error}</span>
        </div>
      )}

      {isLoading && notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-3">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
          <p className="text-sm font-medium">Loading notifications from database...</p>
        </div>
      ) : (
      <div className="space-y-3">
        {notifications.map((n) => (
          <div
            key={n.id}
            onClick={() => handleNotificationClick(n)}
            className={`marine-card marine-card-hover rounded-2xl p-4.5 border transition cursor-pointer space-y-2 ${
              !n.isRead ? 'border-cyan-700/80 bg-marine-850' : 'border-marine-800 opacity-75'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                {n.severity === 'critical' ? (
                  <AlertOctagon className="w-5 h-5 text-red-500 animate-pulse shrink-0" />
                ) : n.severity === 'success' ? (
                  <Fish className="w-5 h-5 text-emerald-400 shrink-0" />
                ) : (
                  <FolderKanban className="w-5 h-5 text-cyan-400 shrink-0" />
                )}
                <h3 className="font-bold text-white text-sm">{n.title}</h3>
              </div>

              <span className="text-[10px] text-slate-500 font-mono shrink-0">
                {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed pl-7">{n.message}</p>
          </div>
        ))}
      </div>
      )}
    </div>
  );
};
