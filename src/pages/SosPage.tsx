import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSosStore } from '../store/sosStore';
import {
  AlertOctagon,
  PhoneCall,
  MapPin,
} from 'lucide-react';

export const SosPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { incidents, openTriggerModal } = useSosStore();

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-red-950 via-marine-900 to-marine-850 p-5 rounded-2xl border border-red-900/60 shadow-glow-sos">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-red-600 text-white rounded font-mono text-xs font-extrabold tracking-wider animate-pulse flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              {t('sos.alertTitle', 'Maritime Emergency Dispatch')}
            </span>
            <span className="text-xs text-red-300 font-mono">Indian Coast Guard SAR Link</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            {t('nav.sos', 'Emergency SOS')}
          </h1>
          <p className="text-xs text-slate-300">
            {t('sos.confirmPrompt', 'Are you sure you want to broadcast an emergency distress signal?')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="tel:1554"
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-extrabold text-xs rounded-xl shadow-glow-amber flex items-center gap-1.5 transition"
          >
            <PhoneCall className="w-4 h-4" />
            <span>{t('safety.hotline', 'Coast Guard: 1554')}</span>
          </a>
          <button
            onClick={openTriggerModal}
            className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow-glow-sos animate-pulse flex items-center gap-2 transition"
          >
            <AlertOctagon className="w-4 h-4" />
            <span>{t('sos.triggerButton', 'Broadcast New SOS')}</span>
          </button>
        </div>
      </div>

      {/* Incidents Grid */}
      <div className="space-y-4">
        {incidents.map((sos) => {
          const isResponding = sos.status === 'responding';
          return (
            <div
              key={sos.id}
              className={`marine-card rounded-2xl p-5 border transition space-y-4 cursor-pointer ${
                isResponding ? 'border-red-500/80 bg-red-950/20 shadow-glow-sos' : 'border-marine-750'
              }`}
              onClick={() => navigate(`/sos/${sos.id}`)}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-marine-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-red-950 text-red-400 border border-red-800 rounded font-mono text-xs font-bold">
                    {sos.incidentCode}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    Ref: {sos.coastGuardCaseRef || 'PENDING'}
                  </span>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold uppercase ${
                    sos.status === 'responding'
                      ? 'bg-red-600 text-white animate-pulse'
                      : sos.status === 'assigned'
                      ? 'bg-amber-500 text-black'
                      : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  }`}
                >
                  {sos.status}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white leading-snug">{sos.emergencyType}</h3>
                  <p className="text-xs text-slate-300 font-mono flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                    {sos.locationDescription}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono text-slate-300 shrink-0">
                  <div className="p-2.5 bg-marine-950 border border-marine-750 rounded-xl">
                    <span className="text-[10px] text-slate-400 uppercase">Affected</span>
                    <p className="font-extrabold text-red-400">{sos.peopleAffectedCount} Souls</p>
                  </div>
                  <div className="p-2.5 bg-marine-950 border border-marine-750 rounded-xl">
                    <span className="text-[10px] text-slate-400 uppercase">Shore Dist</span>
                    <p className="font-bold text-cyan-300">{sos.distanceFromShoreKm} km</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-marine-800 font-mono">
                <span>Caller: <strong className="text-white">{sos.callerName}</strong> ({sos.callerPhone})</span>
                <span className="text-red-400 font-bold flex items-center gap-1">
                  Incident Command & Timeline ({sos.timeline.length}) →
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
