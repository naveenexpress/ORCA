import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAgentStore } from '../store/agentStore';
import {
  ArrowLeft,
  Star,
  Award,
  CheckCircle,
  Shield,
} from 'lucide-react';

export const AgentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { agents } = useAgentStore();

  const agent = agents.find((a) => a.id === id) || agents[0];

  return (
    <div className="space-y-6 pb-16 max-w-4xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-xs font-semibold text-cyan-400 hover:underline"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Agent Directory</span>
      </button>

      {/* Main Profile Header Card */}
      <div className="marine-card rounded-3xl p-6 md:p-8 border border-marine-750 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-marine-750 pb-6">
          <div className="flex items-center gap-5">
            <img
              src={agent.avatar}
              alt={agent.name}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-cyan-400 shadow-glow-cyan"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-cyan-950 text-cyan-300 border border-cyan-800 rounded font-mono text-xs font-bold">
                  {agent.badgeNumber}
                </span>
                <span className="px-2.5 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded font-mono text-xs font-bold uppercase">
                  {agent.status}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-white">{agent.name}</h1>
              <p className="text-xs text-slate-400">{agent.organization} &bull; {agent.district}, {agent.state}</p>
            </div>
          </div>

          <div className="p-4 bg-marine-950 border border-marine-750 rounded-2xl text-center">
            <span className="text-xs text-slate-400 font-mono">User Performance</span>
            <div className="flex items-center justify-center gap-1 text-amber-400 font-extrabold text-xl font-mono mt-0.5">
              <Star className="w-5 h-5 fill-amber-400" />
              <span>{agent.performance.rating}</span>
            </div>
            <p className="text-[10px] text-slate-500 font-mono">{agent.performance.casesCompleted} Cases Resolved</p>
          </div>
        </div>

        {/* Telemetry Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-3 bg-marine-950 border border-marine-750 rounded-xl space-y-0.5">
            <span className="text-[10px] text-slate-400 uppercase">Workload Capacity</span>
            <p className="text-base font-bold text-cyan-300">{agent.currentWorkload} / {agent.maxWorkload}</p>
          </div>
          <div className="p-3 bg-marine-950 border border-marine-750 rounded-xl space-y-0.5">
            <span className="text-[10px] text-slate-400 uppercase">Avg Response Time</span>
            <p className="text-base font-bold text-white">{agent.performance.avgResponseMinutes} min</p>
          </div>
          <div className="p-3 bg-marine-950 border border-marine-750 rounded-xl space-y-0.5">
            <span className="text-[10px] text-slate-400 uppercase">Experience</span>
            <p className="text-base font-bold text-white">{agent.experienceYears} Years</p>
          </div>
          <div className="p-3 bg-marine-950 border border-marine-750 rounded-xl space-y-0.5">
            <span className="text-[10px] text-slate-400 uppercase">Acceptance Rate</span>
            <p className="text-base font-bold text-emerald-400">{agent.performance.acceptanceRatePercent}%</p>
          </div>
        </div>

        {/* Skills & Certifications */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-4 bg-marine-950 border border-marine-750 rounded-2xl space-y-2">
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <Award className="w-4 h-4 text-cyan-400" />
              <span>Skills & Competencies</span>
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {agent.skills.map((s) => (
                <span key={s} className="px-2.5 py-1 bg-marine-900 border border-marine-700 rounded-lg text-xs text-slate-200">
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div className="p-4 bg-marine-950 border border-marine-750 rounded-2xl space-y-2">
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-cyan-400" />
              <span>Certified Maritime Brevets</span>
            </h4>
            <ul className="text-xs text-slate-300 space-y-1">
              {agent.certifications.map((c, i) => (
                <li key={i} className="flex items-center gap-1.5 text-cyan-300">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
