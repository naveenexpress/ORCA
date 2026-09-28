import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FolderKanban,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useCaseStore } from '../store/caseStore';
import { useAgentStore } from '../store/agentStore';
import { useNotifStore } from '../store/notifStore';
import { CaseItem, AllocationExplanation } from '../types';
import { rankAgentsForCase } from '../services/allocationEngine';

export const AllocationPage: React.FC = () => {
  const { t } = useTranslation();
  const { cases } = useCaseStore();
  const { agents, zones, runAutoAllocation } = useAgentStore();
  const { addNotification } = useNotifStore();

  const [selectedCase, setSelectedCase] = useState<CaseItem>(cases[0]);
  const [rankedResults, setRankedResults] = useState<AllocationExplanation[]>([]);
  const [hasRun, setHasRun] = useState(false);

  const handleRunRankings = () => {
    const results = rankAgentsForCase(selectedCase, agents, zones);
    setRankedResults(results);
    setHasRun(true);
  };

  const handleConfirmAssignment = (result: AllocationExplanation) => {
    runAutoAllocation(selectedCase);
    addNotification({
      type: 'case_assigned',
      title: `✅ Agent Allocated: ${result.agentName}`,
      message: `Assigned to case ${selectedCase.caseNumber} (Score: ${result.score}/100).`,
      severity: 'success',
      recipientRole: 'supervisor',
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-marine-900 via-marine-850 to-cyan-950/40 p-5 rounded-2xl border border-marine-750 shadow-hud">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-cyan-950 text-cyan-300 border border-cyan-800 rounded font-mono text-xs font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              {t('nav.allocation', 'Agent Allocation')}
            </span>
            <span className="text-xs text-slate-400 font-mono">Distance, Language, Skills & Capacity Balancing</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            {t('allocation.title', 'Autonomous Field Agent Allocation Matrix')}
          </h1>
          <p className="text-xs text-slate-300">
            {t('allocation.subtitle', 'Automated multi-factor matching between maritime cases, operational zones, and certified field officers.')}
          </p>
        </div>
      </div>

      {/* Allocation Studio Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Case Selection */}
        <div className="marine-card rounded-2xl p-5 border border-marine-750 space-y-4">
          <h3 className="font-bold text-white text-sm flex items-center gap-2 border-b border-marine-750 pb-2.5">
            <FolderKanban className="w-4 h-4 text-cyan-400" />
            <span>Select Service Request ({cases.length})</span>
          </h3>

          <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
            {cases.map((c) => {
              const isSelected = selectedCase?.id === c.id;
              return (
                <div
                  key={c.id}
                  onClick={() => {
                    setSelectedCase(c);
                    setHasRun(false);
                  }}
                  className={`p-3.5 rounded-xl border transition cursor-pointer space-y-2 ${
                    isSelected
                      ? 'bg-cyan-950/50 border-cyan-500 shadow-glow-cyan'
                      : 'bg-marine-950 border-marine-750 hover:border-marine-600'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-white text-xs">{c.title}</span>
                    <span className="px-1.5 py-0.2 bg-marine-800 text-cyan-300 rounded text-[9px] font-mono">
                      {c.priority}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 line-clamp-2">{c.description}</p>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1 border-t border-marine-800">
                    <span>{c.requesterName}</span>
                    <span className="text-cyan-400 uppercase">Lang: {c.language}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 2 Cols: Allocation Matrix & Ranked Agents */}
        <div className="lg:col-span-2 marine-card rounded-2xl p-5 border border-marine-750 space-y-5">
          {selectedCase && (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-marine-750 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-cyan-950 text-cyan-300 border border-cyan-800 rounded font-mono text-xs font-bold">
                      {selectedCase.caseNumber}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      Location: {selectedCase.locationName}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mt-1">{selectedCase.title}</h3>
                </div>

                <button
                  onClick={handleRunRankings}
                  className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-black font-extrabold text-xs rounded-xl shadow-glow-cyan transition flex items-center gap-2 self-start sm:self-auto"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Execute Allocation Matching</span>
                </button>
              </div>

              {/* Ranked Agents Results */}
              {hasRun ? (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-300 flex items-center justify-between">
                    <span>Ranked Field Agent Candidates ({rankedResults.length})</span>
                    <span className="text-cyan-400 font-mono text-[11px]">Multi-Criteria Composite Score</span>
                  </h4>

                  <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                    {rankedResults.map((res, idx) => {
                      const isTopMatch = idx === 0;
                      return (
                        <div
                          key={res.agentId}
                          className={`p-4 rounded-2xl border space-y-3 transition ${
                            isTopMatch
                              ? 'bg-cyan-950/40 border-cyan-500 shadow-glow-cyan'
                              : 'bg-marine-950 border-marine-750'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold ${
                                isTopMatch ? 'bg-cyan-500 text-black' : 'bg-marine-800 text-slate-400'
                              }`}>
                                #{idx + 1}
                              </span>
                              <div>
                                <h4 className="font-bold text-white text-sm">{res.agentName}</h4>
                                <p className="text-[11px] text-slate-400 font-mono">
                                  Distance: <strong className="text-white">{res.distanceKm} km</strong> &bull; Match Score: <strong className="text-cyan-400">{res.score}/100</strong>
                                </p>
                              </div>
                            </div>

                            <button
                              onClick={() => handleConfirmAssignment(res)}
                              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                                isTopMatch
                                  ? 'bg-emerald-600 hover:bg-emerald-500 text-black shadow-glow-teal'
                                  : 'bg-marine-800 hover:bg-marine-750 text-cyan-300'
                              }`}
                            >
                              Assign Agent
                            </button>
                          </div>

                          {/* Score Breakdown Pills */}
                          <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono">
                            <div className="p-1.5 bg-marine-900 rounded-lg">
                              <span className="text-[9px] text-slate-400">Distance</span>
                              <p className="text-white font-bold">{res.distanceScore} pts</p>
                            </div>
                            <div className="p-1.5 bg-marine-900 rounded-lg">
                              <span className="text-[9px] text-slate-400">Workload</span>
                              <p className="text-white font-bold">{res.workloadScore} pts</p>
                            </div>
                            <div className="p-1.5 bg-marine-900 rounded-lg">
                              <span className="text-[9px] text-slate-400">Language</span>
                              <p className="text-white font-bold">{res.languageMatchScore} pts</p>
                            </div>
                            <div className="p-1.5 bg-marine-900 rounded-lg">
                              <span className="text-[9px] text-slate-400">Skills</span>
                              <p className="text-white font-bold">{res.skillMatchScore} pts</p>
                            </div>
                          </div>

                          {/* Explainability Box */}
                          <div className="p-2.5 bg-marine-900/80 rounded-xl text-xs text-slate-300 font-sans border-l-2 border-cyan-400">
                            <strong>AI Rationale:</strong> {res.reasonText}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center bg-marine-950/60 border border-dashed border-marine-750 rounded-2xl space-y-2">
                  <Zap className="w-8 h-8 text-cyan-400 mx-auto animate-pulse" />
                  <h4 className="text-sm font-bold text-white">Click "Execute Allocation Matching"</h4>
                  <p className="text-xs text-slate-400">
                    The ORCA autonomous agent engine will evaluate available field agents against proximity, language, and skill requirements.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
