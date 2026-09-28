import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCaseStore } from '../store/caseStore';
import {
  CheckSquare,
  Search,
  MapPin,
} from 'lucide-react';

export const TasksPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { tasks } = useCaseStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredTasks = tasks.filter((t) => {
    if (statusFilter !== 'ALL' && t.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        t.taskId.toLowerCase().includes(q) ||
        t.agentName.toLowerCase().includes(q)
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
              <CheckSquare className="w-3.5 h-3.5 text-cyan-400" />
              {t('nav.tasks', 'Field Tasks')}
            </span>
            <span className="text-xs text-slate-400 font-mono">Operations Dispatch</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            {t('tasks.title', 'Field Operations & Tasks')}
          </h1>
          <p className="text-xs text-slate-300">
            {t('tasks.subtitle', 'Assigned field inspections, weather briefings, radio relay checks, and emergency response actions.')}
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="marine-card rounded-2xl p-4 border border-marine-750 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('common.search', 'Search by task #, title, or agent name...')}
            className="w-full bg-marine-950 border border-marine-750 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-marine-950 border border-marine-750 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
        >
          <option value="ALL">{t('tasks.allTasks', 'All Task Statuses')}</option>
          <option value="in_progress">In Progress</option>
          <option value="accepted">Accepted</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Task Cards List */}
      <div className="space-y-4">
        {filteredTasks.map((task) => (
          <div
            key={task.id}
            className="marine-card marine-card-hover rounded-2xl p-5 border border-marine-750 space-y-3 cursor-pointer"
            onClick={() => navigate(`/tasks/${task.id}`)}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-cyan-950 text-cyan-300 border border-cyan-800 rounded font-mono text-[10px] font-bold">
                    {task.taskId}
                  </span>
                  <span className="px-2 py-0.5 bg-marine-800 text-slate-300 rounded font-mono text-[10px] font-bold uppercase">
                    {task.priority}
                  </span>
                </div>
                <h3 className="font-bold text-white text-base mt-1 leading-snug">{task.title}</h3>
              </div>

              <span
                className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold uppercase ${
                  task.status === 'completed'
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                }`}
              >
                {task.status}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">{task.description}</p>

            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 pt-2 border-t border-marine-800 font-mono">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                  {task.locationName}
                </span>
                <span>Agent: <strong className="text-white">{task.agentName}</strong></span>
              </div>
              <span className="text-cyan-400 font-semibold flex items-center gap-1">
                View Task Details ({task.notes.length} notes) →
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
