import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSosStore } from '../store/sosStore';
import { SosStatus } from '../types';
import {
  ArrowLeft,
  Clock,
  PhoneCall,
  Navigation,
} from 'lucide-react';

export const SosDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { incidents, updateSosStatus } = useSosStore();

  const incident = incidents.find((i) => i.id === id) || incidents[0];
  const [timelineNote, setTimelineNote] = useState('');

  const handleUpdateStatus = (newStatus: SosStatus) => {
    updateSosStatus(incident.id, newStatus, timelineNote || 'SAR Status Changed', 'Command Officer');
    setTimelineNote('');
  };

  return (
    <div className="space-y-6 pb-16 max-w-4xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-xs font-semibold text-cyan-400 hover:underline"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to SOS Incidents</span>
      </button>

      {/* Main Incident Sheet */}
      <div className="marine-card rounded-3xl p-6 md:p-8 border border-red-900/80 shadow-glow-sos space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-marine-750 pb-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-red-950 text-red-400 border border-red-800 rounded font-mono text-xs font-bold">
                {incident.incidentCode}
              </span>
              <span className="px-2.5 py-0.5 bg-marine-950 text-amber-300 border border-marine-750 rounded font-mono text-xs font-bold">
                {incident.severity}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white">{incident.emergencyType}</h1>
            <p className="text-xs text-slate-300 font-mono">
              Caller: <strong className="text-white">{incident.callerName}</strong> ({incident.callerPhone})
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="tel:1554"
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Call 1554</span>
            </a>
            <button
              onClick={() => navigate(`/map?sosId=${incident.id}`)}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-black font-extrabold text-xs rounded-xl flex items-center gap-1.5"
            >
              <Navigation className="w-4 h-4" />
              <span>Locate on Map</span>
            </button>
          </div>
        </div>

        {/* Telemetry Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-3 bg-marine-950 border border-marine-750 rounded-xl">
            <span className="text-[10px] text-slate-400">Souls Aboard</span>
            <p className="text-lg font-extrabold text-red-400">{incident.peopleAffectedCount} Persons</p>
          </div>
          <div className="p-3 bg-marine-950 border border-marine-750 rounded-xl">
            <span className="text-[10px] text-slate-400">Vessel Number</span>
            <p className="text-xs font-bold text-white truncate">{incident.vesselRegNumber}</p>
          </div>
          <div className="p-3 bg-marine-950 border border-marine-750 rounded-xl">
            <span className="text-[10px] text-slate-400">Shore Distance</span>
            <p className="text-lg font-bold text-cyan-300">{incident.distanceFromShoreKm} km</p>
          </div>
          <div className="p-3 bg-marine-950 border border-marine-750 rounded-xl">
            <span className="text-[10px] text-slate-400">GPS Coordinates</span>
            <p className="text-xs font-bold text-white">
              {incident.coordinates.lat.toFixed(3)}°N, {incident.coordinates.lng.toFixed(3)}°E
            </p>
          </div>
        </div>

        {/* Incident State Changer */}
        <div className="p-4 bg-marine-950 border border-marine-750 rounded-2xl space-y-3">
          <h3 className="text-xs font-bold text-slate-300">Set Response State:</h3>
          <div className="flex flex-wrap gap-2">
            {(['received', 'assigned', 'responding', 'escalated', 'resolved', 'closed'] as SosStatus[]).map((st) => (
              <button
                key={st}
                onClick={() => handleUpdateStatus(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase font-mono transition ${
                  incident.status === st
                    ? 'bg-red-600 text-white shadow-glow-sos'
                    : 'bg-marine-850 hover:bg-marine-750 text-slate-300'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Incident Timeline */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span>Search & Rescue Timeline ({incident.timeline.length})</span>
          </h3>

          <div className="space-y-2 max-h-60 overflow-y-auto divide-y divide-marine-800">
            {incident.timeline.map((entry, idx) => (
              <div key={idx} className="pt-2 text-xs space-y-0.5">
                <div className="flex items-center justify-between text-slate-400 font-mono text-[11px]">
                  <span className="font-bold text-cyan-400">{entry.action}</span>
                  <span>{new Date(entry.time).toLocaleTimeString()}</span>
                </div>
                <p className="text-slate-200 font-sans">{entry.notes}</p>
                <p className="text-[10px] text-slate-500 italic">By {entry.actor}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
