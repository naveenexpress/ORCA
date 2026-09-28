import React, { useState } from 'react';
import {
  Users2,
  FolderKanban,
  SlidersHorizontal,
  UserCheck,
  Sparkles,
} from 'lucide-react';
import { useCaseStore } from '../../store/caseStore';
import { useAgentStore } from '../../store/agentStore';
import { useNotifStore } from '../../store/notifStore';
import { useTranslation } from 'react-i18next';
import { CaseItem, AllocationExplanation } from '../../types';
import { Link } from 'react-router-dom';

export const SupervisorDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { cases } = useCaseStore();
  const { agents, zones, runAutoAllocation, overrideAllocation } = useAgentStore();
  const { addNotification } = useNotifStore();

  const [selectedCaseForAlloc, setSelectedCaseForAlloc] = useState<CaseItem | null>(cases[0] || null);
  const [allocationResult, setAllocationResult] = useState<AllocationExplanation | null>(null);
  const [overrideModalOpen, setOverrideModalOpen] = useState(false);
  const [overrideAgentId, setOverrideAgentId] = useState(agents[0].id);
  const [overrideReason, setOverrideReason] = useState('');

  const unassignedCases = cases.filter((c) => c.status === 'unassigned' || c.status === 'new');
  const activeAgents = agents.filter((a) => a.status === 'available' || a.status === 'busy');

  const handleRunAutoAllocation = () => {
    if (!selectedCaseForAlloc) return;
    const result = runAutoAllocation(selectedCaseForAlloc);
    setAllocationResult(result);

    addNotification({
      type: 'case_assigned',
      title: `⚡ AI Auto-Allocated: ${selectedCaseForAlloc.caseNumber}`,
      message: `Assigned to ${result.agentName} (Score: ${result.score}/100) based on proximity, workload & language match.`,
      severity: 'info',
      recipientRole: 'supervisor',
    });
  };

  const handleApplyOverride = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCaseForAlloc || !overrideReason.trim()) return;

    overrideAllocation(selectedCaseForAlloc.id, overrideAgentId, overrideReason);
    setOverrideModalOpen(false);
    setOverrideReason('');

    addNotification({
      type: 'case_assigned',
      title: `🛡️ Supervisor Override Recorded`,
      message: `Case ${selectedCaseForAlloc.caseNumber} manually reassigned. Audit trail updated.`,
      severity: 'warning',
      recipientRole: 'supervisor',
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#F4FAFD] to-[#E8F8FB] p-5 rounded-2xl border border-[#CFE6EF] shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-[#E8F8FB] text-[#1769AA] border border-[#CFE6EF] rounded font-mono text-xs font-bold flex items-center gap-1.5">
              <Users2 className="w-3.5 h-3.5 text-[#168DCC]" />
              OPERATIONS SUPERVISOR COCKPIT
            </span>
            <span className="text-xs text-[#7890A5] font-mono">Coromandel & Northern Circars Zone</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#123B6D] tracking-tight">
            👔 {t('dashboards.supervisorTitle', 'Operations Workload & Allocation Control')}
          </h1>
          <p className="text-xs text-[#55718D]">
            Explainable multi-criteria dispatch balancing geographical distance, language proficiency, skills, and active case load.
          </p>
        </div>

        {/* Action Button */}
        <Link
          to="/allocation"
          className="px-4 py-2 bg-[#1769AA] hover:bg-[#123B6D] text-white font-extrabold text-xs rounded-xl shadow-sm transition flex items-center gap-2"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Open Full Allocation Matrix</span>
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-[#D7E7F0] shadow-sm space-y-1">
          <span className="text-[10px] font-mono uppercase text-[#55718D]">Unassigned Requests</span>
          <p className="text-2xl font-extrabold text-[#E7A928] font-mono">{unassignedCases.length}</p>
          <p className="text-[11px] text-[#7890A5] font-mono">Requires Dispatch</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#D7E7F0] shadow-sm space-y-1">
          <span className="text-[10px] font-mono uppercase text-[#55718D]">Active Field Agents</span>
          <p className="text-2xl font-extrabold text-[#1769AA] font-mono">{activeAgents.length} / {agents.length}</p>
          <p className="text-[11px] text-[#24A978] font-mono">Online & Field Ready</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#D7E7F0] shadow-sm space-y-1">
          <span className="text-[10px] font-mono uppercase text-[#55718D]">Total Operational Zones</span>
          <p className="text-2xl font-extrabold text-[#123B6D] font-mono">{zones.length}</p>
          <p className="text-[11px] text-[#168DCC] font-mono">1 Congested (Vizag)</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#D7E7F0] shadow-sm space-y-1">
          <span className="text-[10px] font-mono uppercase text-[#55718D]">SLA Resolution Rate</span>
          <p className="text-2xl font-extrabold text-[#24A978] font-mono">96.8%</p>
          <p className="text-[11px] text-[#7890A5] font-mono">Within 4-Hour Target</p>
        </div>
      </div>

      {/* Main Allocation Engine Interactive Cockpit */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Pending Cases for Allocation */}
        <div className="bg-white rounded-2xl p-5 border border-[#D7E7F0] shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#D7E7F0] pb-2.5">
            <h3 className="font-bold text-[#123B6D] text-sm flex items-center gap-2">
              <FolderKanban className="w-4 h-4 text-[#1769AA]" />
              <span>Service Request Queue ({cases.length})</span>
            </h3>
            <span className="text-[10px] font-mono text-[#1769AA] font-bold">Select to Match</span>
          </div>

          <div className="space-y-2.5 max-h-[440px] overflow-y-auto pr-1">
            {cases.map((c) => {
              const isSelected = selectedCaseForAlloc?.id === c.id;
              return (
                <div
                  key={c.id}
                  onClick={() => {
                    setSelectedCaseForAlloc(c);
                    setAllocationResult(null);
                  }}
                  className={`p-3 rounded-xl border transition cursor-pointer space-y-1.5 ${
                    isSelected
                      ? 'bg-[#E8F8FB] border-[#19B7C9] shadow-sm'
                      : 'bg-[#F4FAFD] border-[#D7E7F0] hover:border-[#BFD6E4]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#123B6D] line-clamp-1">{c.title}</span>
                    <span className="px-1.5 py-0.2 bg-[#E8F8FB] text-[#1769AA] border border-[#CFE6EF] rounded text-[9px] font-mono uppercase">
                      {c.priority}
                    </span>
                  </div>

                  <p className="text-[11px] text-[#55718D] line-clamp-1">{c.description}</p>

                  <div className="flex items-center justify-between text-[10px] text-[#7890A5] font-mono pt-1 border-t border-[#D7E7F0]">
                    <span>{c.requesterName}</span>
                    <span className="text-[#1769AA] uppercase font-semibold">{c.language}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 2 Cols: AI Explainable Allocation Recommendation */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-[#D7E7F0] shadow-sm space-y-5">
          {selectedCaseForAlloc ? (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#D7E7F0] pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-[#E8F8FB] text-[#1769AA] border border-[#CFE6EF] rounded font-mono text-xs font-bold">
                      {selectedCaseForAlloc.caseNumber}
                    </span>
                    <span className="text-xs text-[#55718D] font-mono">
                      Language: <strong className="text-[#123B6D] uppercase">{selectedCaseForAlloc.language}</strong>
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-[#123B6D] mt-1">{selectedCaseForAlloc.title}</h3>
                </div>

                <button
                  onClick={handleRunAutoAllocation}
                  className="px-4 py-2 bg-[#1769AA] hover:bg-[#123B6D] text-white font-extrabold text-xs rounded-xl shadow-sm transition flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <Sparkles className="w-4 h-4 text-[#19B7C9]" />
                  <span>Run Multi-Criteria AI Matching</span>
                </button>
              </div>

              {/* Allocation Result Display */}
              {allocationResult ? (
                <div className="p-4 bg-[#F4FAFD] border border-[#CFE6EF] rounded-2xl space-y-4 animate-in fade-in">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-[#EAF8F1] text-[#24A978] rounded-xl border border-[#BFE7D1]">
                        <UserCheck className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-[10px] font-mono uppercase text-[#24A978] font-bold tracking-wider">
                          OPTIMAL AGENT MATCH FOUND
                        </span>
                        <h4 className="text-lg font-bold text-[#123B6D]">{allocationResult.agentName}</h4>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-[#55718D] font-mono uppercase">Composite Score</span>
                      <p className="text-2xl font-extrabold text-[#1769AA] font-mono">
                        {allocationResult.score} <span className="text-xs text-[#7890A5] font-normal">/ 100</span>
                      </p>
                    </div>
                  </div>

                  {/* Multi-Criteria Score Breakdown Bar */}
                  <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono">
                    <div className="p-2 bg-white border border-[#D7E7F0] rounded-xl">
                      <span className="text-[10px] text-[#55718D]">Distance</span>
                      <p className="font-bold text-[#123B6D]">{allocationResult.distanceKm} km</p>
                      <p className="text-[10px] text-[#1769AA]">+{allocationResult.distanceScore} pts</p>
                    </div>
                    <div className="p-2 bg-white border border-[#D7E7F0] rounded-xl">
                      <span className="text-[10px] text-[#55718D]">Workload</span>
                      <p className="font-bold text-[#123B6D]">Capacity</p>
                      <p className="text-[10px] text-[#1769AA]">+{allocationResult.workloadScore} pts</p>
                    </div>
                    <div className="p-2 bg-white border border-[#D7E7F0] rounded-xl">
                      <span className="text-[10px] text-[#55718D]">Language</span>
                      <p className="font-bold text-[#24A978]">Direct</p>
                      <p className="text-[10px] text-[#1769AA]">+{allocationResult.languageMatchScore} pts</p>
                    </div>
                    <div className="p-2 bg-white border border-[#D7E7F0] rounded-xl">
                      <span className="text-[10px] text-[#55718D]">Skills</span>
                      <p className="font-bold text-[#123B6D]">Certified</p>
                      <p className="text-[10px] text-[#1769AA]">+{allocationResult.skillMatchScore} pts</p>
                    </div>
                  </div>

                  {/* Explainability Natural Language Rationale Box */}
                  <div className="p-3 bg-[#E8F8FB] border border-[#CFE6EF] rounded-xl text-xs space-y-1">
                    <span className="text-[10px] font-mono text-[#1769AA] uppercase font-bold flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-[#19B7C9]" />
                      Explainable Allocation Rationale:
                    </span>
                    <p className="text-[#123B6D] leading-relaxed font-sans">{allocationResult.reasonText}</p>
                  </div>

                  {/* Action Toolbar */}
                  <div className="flex gap-2 pt-2 border-t border-[#D7E7F0]">
                    <button
                      onClick={() => setOverrideModalOpen(true)}
                      className="px-4 py-2 bg-white hover:bg-[#E8F8FB] text-[#123B6D] text-xs font-semibold rounded-xl border border-[#BFD6E4] transition"
                    >
                      Supervisor Override
                    </button>
                    <button
                      onClick={() => {
                        addNotification({
                          type: 'case_assigned',
                          title: '✅ Allocation Confirmed',
                          message: `Dispatched task to ${allocationResult.agentName}.`,
                          severity: 'success',
                          recipientRole: 'agent',
                        });
                      }}
                      className="flex-1 py-2 bg-[#24A978] hover:bg-[#1f9368] text-white font-extrabold text-xs rounded-xl shadow-sm transition"
                    >
                      Confirm & Dispatch to Agent
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center bg-[#F4FAFD] border border-dashed border-[#CFE6EF] rounded-2xl space-y-3">
                  <SlidersHorizontal className="w-8 h-8 text-[#1769AA] mx-auto animate-pulse" />
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-[#123B6D]">Ready for Multi-Agent Allocation</h4>
                    <p className="text-xs text-[#55718D] max-w-sm mx-auto">
                      Click "Run Multi-Criteria AI Matching" to evaluate distance, skills, language, and workload.
                    </p>
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className="text-xs text-[#7890A5] text-center py-10">Select a case from the queue to start allocation.</p>
          )}
        </div>
      </div>

      {/* Manual Override Modal */}
      {overrideModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white border border-[#D7E7F0] rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-[#123B6D]">Supervisor Manual Allocation Override</h3>
              <p className="text-xs text-[#55718D]">
                You are manually overriding the autonomous matching engine. A mandatory justification must be recorded in the audit log.
              </p>
            </div>

            <form onSubmit={handleApplyOverride} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#123B6D] mb-1">Select Field Agent</label>
                <select
                  value={overrideAgentId}
                  onChange={(e) => setOverrideAgentId(e.target.value)}
                  className="w-full bg-[#F4FAFD] border border-[#C9DDE8] rounded-xl px-3 py-2 text-xs text-[#123B6D] focus:outline-none focus:border-[#19B7C9]"
                >
                  {agents.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.organization} - {a.district})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#123B6D] mb-1">
                  Mandatory Override Justification *
                </label>
                <textarea
                  required
                  rows={3}
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder="e.g. Assigned Agent B due to specialized deep-sea gear inspection requirement requested by cooperative..."
                  className="w-full bg-[#F4FAFD] border border-[#C9DDE8] rounded-xl p-3 text-xs text-[#123B6D] focus:outline-none focus:border-[#19B7C9]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOverrideModalOpen(false)}
                  className="flex-1 py-2 bg-white hover:bg-[#F4FAFD] text-[#55718D] border border-[#D7E7F0] text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-[#E7A928] hover:bg-[#d49822] text-white font-bold text-xs rounded-xl shadow-sm"
                >
                  Confirm Override
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
