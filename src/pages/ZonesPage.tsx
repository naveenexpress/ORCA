import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers } from 'lucide-react';
import { useAgentStore } from '../store/agentStore';

export const ZonesPage: React.FC = () => {
  const navigate = useNavigate();
  const { zones } = useAgentStore();

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-marine-900 via-marine-850 to-cyan-950/40 p-5 rounded-2xl border border-marine-750 shadow-hud">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-cyan-950 text-cyan-300 border border-cyan-800 rounded font-mono text-xs font-bold flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              OPERATIONAL MARITIME SERVICE ZONES
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Operational Zones & Boundaries
          </h1>
          <p className="text-xs text-slate-300">
            Spatial polygon boundaries, agent capacities, risk levels, and harbour staging basins.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {zones.map((zone) => (
          <div
            key={zone.id}
            className="marine-card marine-card-hover rounded-2xl p-5 border border-marine-750 space-y-4"
          >
            <div className="flex items-start justify-between gap-2 border-b border-marine-800 pb-3">
              <div>
                <span className="px-2 py-0.5 bg-cyan-950 text-cyan-300 border border-cyan-800 rounded font-mono text-[10px] font-bold">
                  {zone.code}
                </span>
                <h3 className="font-bold text-white text-base mt-1.5">{zone.name}</h3>
              </div>
              <span
                className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold uppercase ${
                  zone.priority === 'Critical' ? 'bg-red-500 text-white' : 'bg-marine-800 text-slate-300'
                }`}
              >
                {zone.priority}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">{zone.description}</p>

            <div className="grid grid-cols-2 gap-2 p-2.5 bg-marine-950 border border-marine-750 rounded-xl text-xs font-mono text-slate-300">
              <div>
                <span className="text-[10px] text-slate-400">Active Cases</span>
                <p className="font-bold text-cyan-300">{zone.currentActiveCases} / {zone.capacity}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400">Status</span>
                <p className="font-bold text-emerald-400 uppercase">{zone.status}</p>
              </div>
            </div>

            <div className="pt-2 border-t border-marine-800 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-mono">{zone.district}, {zone.state}</span>
              <button
                onClick={() => navigate(`/map`)}
                className="text-cyan-400 hover:text-cyan-300 font-bold"
              >
                View on Map →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
