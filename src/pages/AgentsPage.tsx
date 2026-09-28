import React, { useState } from 'react';
import {
  UserSquare2,
  Search,
  Star,
  ArrowRight,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAgentStore } from '../store/agentStore';
import { useNavigate } from 'react-router-dom';

export const AgentsPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { agents, isLoading, error } = useAgentStore();
  const [search, setSearch] = useState('');
  const [selectedState, setSelectedState] = useState('ALL');

  const filteredAgents = agents.filter((a) => {
    if (selectedState !== 'ALL' && a.state !== selectedState) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        a.name.toLowerCase().includes(q) ||
        a.district.toLowerCase().includes(q) ||
        a.skills.some((s) => s.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-marine-900 via-marine-850 to-cyan-950/40 p-5 rounded-2xl border border-marine-750 shadow-hud">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-cyan-950 text-cyan-300 border border-cyan-800 rounded font-mono text-xs font-bold flex items-center gap-1.5">
              <UserSquare2 className="w-3.5 h-3.5 text-cyan-400" />
              {t('nav.agents', 'Field Agents')}
            </span>
            <span className="text-xs text-slate-400 font-mono">Certified Marine Responders</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            {t('agents.title', 'Field Agent Directory & Readiness')}
          </h1>
          <p className="text-xs text-slate-300">
            {t('agents.subtitle', 'Real-time status, language proficiencies, current case capacities, and certifications across Indian maritime districts.')}
          </p>
        </div>
      </div>

      {/* Non-fatal error banner */}
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 bg-red-950/40 border border-red-800/60 rounded-xl text-red-300 text-xs font-mono">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="marine-card rounded-2xl p-4 border border-marine-750 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('common.search', 'Search agent name, district, or skill...')}
            className="w-full bg-marine-950 border border-marine-750 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <select
          value={selectedState}
          onChange={(e) => setSelectedState(e.target.value)}
          className="bg-marine-950 border border-marine-750 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
        >
          <option value="ALL">All Coastal States</option>
          <option value="Tamil Nadu">Tamil Nadu</option>
          <option value="Andhra Pradesh">Andhra Pradesh</option>
          <option value="Kerala">Kerala</option>
          <option value="Gujarat">Gujarat</option>
          <option value="Odisha">Odisha</option>
          <option value="Maharashtra">Maharashtra</option>
        </select>
      </div>

      {/* Agents Grid */}
      {isLoading && agents.length === 0 && (
        <div className="flex items-center justify-center gap-2 py-16 text-cyan-400 text-xs font-mono">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Loading agents from database…</span>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAgents.map((agent) => (
          <div
            key={agent.id}
            className="marine-card marine-card-hover rounded-2xl p-5 border border-marine-750 space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              {/* Agent Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={agent.avatar}
                    alt={agent.name}
                    className="w-12 h-12 rounded-xl object-cover border border-cyan-400 shadow-md"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="px-1.5 py-0.2 bg-cyan-950 text-cyan-300 border border-cyan-800 rounded font-mono text-[9px] font-bold">
                        {agent.badgeNumber}
                      </span>
                      <span
                        className={`px-1.5 py-0.2 rounded font-mono text-[9px] font-bold uppercase ${
                          agent.status === 'available'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : agent.status === 'busy'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-marine-800 text-slate-400'
                        }`}
                      >
                        {agent.status}
                      </span>
                    </div>
                    <h3 className="font-bold text-white text-sm mt-1">{agent.name}</h3>
                    <p className="text-[11px] text-slate-400 truncate">{agent.organization}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-amber-400 font-bold text-xs flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    {agent.performance.rating}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">{agent.performance.casesCompleted} cases</span>
                </div>
              </div>

              {/* Location & Workload */}
              <div className="grid grid-cols-2 gap-2 p-2.5 bg-marine-950 border border-marine-750 rounded-xl text-xs font-mono text-slate-300">
                <div>
                  <span className="text-[10px] text-slate-400">Base</span>
                  <p className="font-bold text-white truncate">{agent.district}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400">Workload</span>
                  <p className="font-bold text-cyan-300">{agent.currentWorkload} / {agent.maxWorkload}</p>
                </div>
              </div>

              {/* Languages */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-slate-400 text-[11px]">Languages:</span>
                <div className="flex gap-1">
                  {agent.languages.map((l) => (
                    <span key={l} className="px-1.5 py-0.2 bg-marine-900 border border-marine-750 rounded text-[10px] font-mono uppercase text-cyan-300 font-bold">
                      {l}
                    </span>
                  ))}
                </div>
              </div>

              {/* Skills */}
              <div className="flex flex-wrap gap-1">
                {agent.skills.slice(0, 3).map((s) => (
                  <span key={s} className="px-2 py-0.5 bg-marine-900 border border-marine-800 rounded text-[10px] text-slate-300">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-marine-750 flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[11px] font-mono">{agent.lastActive}</span>
              <button
                onClick={() => navigate(`/agents/${agent.id}`)}
                className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1"
              >
                <span>Full Profile</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
