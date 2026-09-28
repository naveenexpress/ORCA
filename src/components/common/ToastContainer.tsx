import React from 'react';
import { AlertOctagon, Fish, Bell, X } from 'lucide-react';
import { useNotifStore } from '../../store/notifStore';

export const ToastContainer: React.FC = () => {
  const { toastNotification, dismissToast } = useNotifStore();

  if (!toastNotification) return null;

  return (
    <div className="fixed bottom-20 right-4 lg:bottom-6 lg:right-6 z-50 max-w-sm w-full animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div
        className={`p-4 rounded-2xl border shadow-2xl backdrop-blur-lg flex items-start gap-3 ${
          toastNotification.severity === 'critical'
            ? 'bg-red-950/95 border-red-500 shadow-glow-sos text-white'
            : toastNotification.severity === 'success'
            ? 'bg-emerald-950/95 border-emerald-500 shadow-glow-teal text-white'
            : 'bg-marine-900/95 border-cyan-500 shadow-glow-cyan text-white'
        }`}
      >
        <div className="shrink-0 mt-0.5">
          {toastNotification.severity === 'critical' ? (
            <AlertOctagon className="w-5 h-5 text-red-400 animate-pulse" />
          ) : toastNotification.severity === 'success' ? (
            <Fish className="w-5 h-5 text-emerald-400" />
          ) : (
            <Bell className="w-5 h-5 text-cyan-400" />
          )}
        </div>

        <div className="flex-1 space-y-1 min-w-0">
          <h4 className="font-bold text-xs leading-snug">{toastNotification.title}</h4>
          <p className="text-[11px] text-slate-200 line-clamp-2 leading-relaxed font-sans">
            {toastNotification.message}
          </p>
        </div>

        <button
          onClick={dismissToast}
          className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-black/20 shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
