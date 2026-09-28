import React, { useState } from 'react';
import {
  AlertOctagon,
  Radio,
  PhoneCall,
  Navigation,
  Send,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSosStore } from '../../store/sosStore';
import { useNotifStore } from '../../store/notifStore';
import { SosStatus } from '../../types';
import { useNavigate } from 'react-router-dom';

export const DisasterDashboard: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { incidents, updateSosStatus } = useSosStore();
  const { addNotification } = useNotifStore();

  const [selectedSosId, setSelectedSosId] = useState<string>(incidents[0]?.id || '');
  const [statusUpdateNote, setStatusUpdateNote] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [isBroadcastSent, setIsBroadcastSent] = useState(false);

  const activeIncident = incidents.find((i) => i.id === selectedSosId) || incidents[0];
  const activeEmergencies = incidents.filter(
    (i) => i.status === 'responding' || i.status === 'assigned' || i.status === 'received'
  );

  const handleBroadcastAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;

    addNotification({
      type: 'system_alert',
      title: '🚨 COASTAL MARITIME WEATHER ALERT BROADCAST',
      message: broadcastMessage,
      severity: 'critical',
      recipientRole: 'all',
    });

    setIsBroadcastSent(true);
    setTimeout(() => setIsBroadcastSent(false), 4000);
    setBroadcastMessage('');
  };

  const handleStatusChange = (newStatus: SosStatus) => {
    if (!activeIncident) return;
    updateSosStatus(activeIncident.id, newStatus, statusUpdateNote, 'Disaster Command Officer');
    setStatusUpdateNote('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#FFF0F1] to-[#F7FBFE] p-5 rounded-2xl border border-[#FCDAD7] shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-[#E5484D] text-white rounded font-mono text-xs font-extrabold tracking-wider animate-pulse flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              SAR INCIDENT COMMAND ACTIVE
            </span>
            <span className="text-xs text-[#E5484D] font-mono">Maritime Rescue Coordination Center</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#123B6D] tracking-tight">
            🚨 {t('dashboards.disasterTitle', 'Disaster & SAR Emergency Incident Command')}
          </h1>
          <p className="text-xs text-[#55718D]">
            Real-time distress beacon triage, SAR fleet dispatch, Indian Coast Guard liaison, and emergency broadcasting.
          </p>
        </div>

        {/* Quick Triage Counters */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-[#FFF0F1] border border-[#FCDAD7] rounded-xl text-center">
            <span className="text-xs text-[#E5484D] font-mono">Active SOS</span>
            <p className="text-xl font-extrabold text-[#123B6D] font-mono">{activeEmergencies.length}</p>
          </div>
          <div className="px-4 py-2 bg-[#F4FAFD] border border-[#D7E7F0] rounded-xl text-center">
            <span className="text-xs text-[#55718D] font-mono">Coast Guard SAR</span>
            <p className="text-xl font-extrabold text-[#E7A928] font-mono">1554 LINK</p>
          </div>
        </div>
      </div>

      {/* Main Command Center Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Live SOS Incident Triage Feed */}
        <div className="bg-white rounded-2xl p-5 border border-[#D7E7F0] shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#D7E7F0] pb-3">
            <div className="flex items-center gap-2">
              <AlertOctagon className="w-5 h-5 text-[#E5484D] animate-pulse" />
              <h3 className="font-bold text-[#123B6D] text-base">Emergency Triage Queue</h3>
            </div>
            <span className="px-2 py-0.5 bg-[#FFF0F1] text-[#E5484D] border border-[#FCDAD7] rounded text-xs font-mono font-bold">
              {incidents.length} TOTAL
            </span>
          </div>

          {/* Incidents List */}
          <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
            {incidents.map((sos) => {
              const isSelected = sos.id === selectedSosId;
              return (
                <div
                  key={sos.id}
                  onClick={() => setSelectedSosId(sos.id)}
                  className={`p-3.5 rounded-xl border transition cursor-pointer space-y-2 ${
                    isSelected
                      ? 'bg-[#FFF0F1] border-[#E5484D] shadow-sm'
                      : 'bg-[#F4FAFD] border-[#D7E7F0] hover:border-[#BFD6E4]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-[#123B6D] text-xs leading-tight line-clamp-1">
                      {sos.emergencyType}
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase shrink-0 ${
                        sos.status === 'responding'
                          ? 'bg-[#E5484D] text-white animate-pulse'
                          : sos.status === 'assigned'
                          ? 'bg-[#E7A928] text-white'
                          : 'bg-[#EAF8F1] text-[#16845F] border border-[#BFE7D1]'
                      }`}
                    >
                      {sos.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#55718D] font-mono">
                    <span>{sos.callerName}</span>
                    <span className="text-[#E5484D] font-bold">{sos.peopleAffectedCount} Souls</span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-[#7890A5] pt-1 border-t border-[#D7E7F0]">
                    <span className="truncate">{sos.locationDescription}</span>
                    <span className="shrink-0">{new Date(sos.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 2 Cols: Active Incident Command Details & Actions */}
        {activeIncident && (
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl p-5 border border-[#D7E7F0] shadow-sm space-y-5">
              {/* Incident Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D7E7F0] pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-[#FFF0F1] text-[#E5484D] border border-[#FCDAD7] rounded text-xs font-mono font-bold">
                      {activeIncident.incidentCode}
                    </span>
                    <span className="text-xs text-[#7890A5] font-mono">
                      Ref: {activeIncident.coastGuardCaseRef || 'PENDING'}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-[#123B6D] mt-1">{activeIncident.emergencyType}</h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate(`/map?sosId=${activeIncident.id}`)}
                    className="px-3 py-1.5 bg-[#1769AA] hover:bg-[#123B6D] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    Locate on Map
                  </button>
                  <a
                    href="tel:1554"
                    className="px-3 py-1.5 bg-[#E5484D] hover:bg-[#D43D42] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md transition"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    Coast Guard 1554
                  </a>
                </div>
              </div>

              {/* Telemetry & Vessel Details */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-[#F4FAFD] border border-[#D7E7F0] rounded-xl space-y-0.5">
                  <span className="text-[10px] text-[#55718D] font-mono uppercase">Vessel Number</span>
                  <p className="text-xs font-bold text-[#123B6D] font-mono truncate">{activeIncident.vesselRegNumber}</p>
                </div>
                <div className="p-3 bg-[#F4FAFD] border border-[#D7E7F0] rounded-xl space-y-0.5">
                  <span className="text-[10px] text-[#55718D] font-mono uppercase">Souls Aboard</span>
                  <p className="text-base font-extrabold text-[#E5484D] font-mono">{activeIncident.peopleAffectedCount} Persons</p>
                </div>
                <div className="p-3 bg-[#F4FAFD] border border-[#D7E7F0] rounded-xl space-y-0.5">
                  <span className="text-[10px] text-[#55718D] font-mono uppercase">Distance from Coast</span>
                  <p className="text-base font-bold text-[#1769AA] font-mono">{activeIncident.distanceFromShoreKm} km</p>
                </div>
                <div className="p-3 bg-[#F4FAFD] border border-[#D7E7F0] rounded-xl space-y-0.5">
                  <span className="text-[10px] text-[#55718D] font-mono uppercase">Coordinates</span>
                  <p className="text-xs font-bold text-[#123B6D] font-mono">
                    {activeIncident.coordinates.lat.toFixed(3)}°N, {activeIncident.coordinates.lng.toFixed(3)}°E
                  </p>
                </div>
              </div>

              {/* Action Toolbar & Status Transition */}
              <div className="p-4 bg-[#F4FAFD] border border-[#D7E7F0] rounded-xl space-y-3">
                <h4 className="text-xs font-bold text-[#123B6D]">Update Incident Command State:</h4>
                <div className="flex flex-wrap gap-2">
                  {(['acknowledged', 'responding', 'escalated', 'resolved', 'closed'] as SosStatus[]).map((st) => (
                    <button
                      key={st}
                      onClick={() => handleStatusChange(st)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase font-mono transition ${
                        activeIncident.status === st
                          ? 'bg-[#1769AA] text-white shadow-sm'
                          : 'bg-white hover:bg-[#E8F8FB] text-[#123B6D] border border-[#BFD6E4]'
                      }`}
                    >
                      Set {st}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={statusUpdateNote}
                    onChange={(e) => setStatusUpdateNote(e.target.value)}
                    placeholder="Add operational notes to incident timeline..."
                    className="flex-1 bg-white border border-[#C9DDE8] rounded-xl px-3 py-1.5 text-xs text-[#123B6D] focus:outline-none focus:border-[#19B7C9]"
                  />
                  <button
                    onClick={() => handleStatusChange(activeIncident.status)}
                    className="px-3 py-1.5 bg-[#1769AA] hover:bg-[#123B6D] text-white rounded-xl text-xs font-semibold"
                  >
                    Log Note
                  </button>
                </div>
              </div>

              {/* Live Timeline */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-[#123B6D] flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#1769AA]" />
                  <span>SAR Incident Timeline & Response Audit</span>
                </h4>

                <div className="space-y-2 max-h-48 overflow-y-auto divide-y divide-[#D7E7F0]">
                  {activeIncident.timeline.map((entry, idx) => (
                    <div key={idx} className="pt-2 text-xs space-y-0.5">
                      <div className="flex items-center justify-between text-[#7890A5] font-mono text-[11px]">
                        <span className="text-[#1769AA] font-bold">{entry.action}</span>
                        <span>{new Date(entry.time).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-[#55718D] font-sans">{entry.notes}</p>
                      <p className="text-[10px] text-[#7890A5] italic">By {entry.actor}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Emergency Broadcast Hazard Banner Tool */}
            <div className="bg-white rounded-2xl p-5 border border-[#D7E7F0] shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-[#E7A928] font-bold text-sm">
                <Radio className="w-5 h-5 animate-pulse" />
                <span>Broadcast Emergency Hazard Bulletin to All Craft in Grid</span>
              </div>
              <form onSubmit={handleBroadcastAlert} className="space-y-3">
                <textarea
                  rows={2}
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  placeholder="e.g. Gale warning: 45kt winds expected off Pulicat. All FRP craft advised to shelter immediately..."
                  className="w-full bg-[#F4FAFD] border border-[#C9DDE8] rounded-xl p-3 text-xs text-[#123B6D] focus:outline-none focus:border-[#E7A928]"
                />
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[#7890A5]">
                    Transmits instant banner alerts to active fishermen and field mobile units.
                  </span>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#E7A928] hover:bg-[#D49822] text-white font-extrabold text-xs rounded-xl flex items-center gap-2 shadow-sm transition"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Broadcast Alert
                  </button>
                </div>
              </form>
              {isBroadcastSent && (
                <div className="p-2.5 bg-[#EAF8F1] border border-[#BFE7D1] text-[#16845F] text-xs rounded-xl flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-[#24A978]" />
                  <span>Hazard bulletin transmitted across regional marine channels.</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
