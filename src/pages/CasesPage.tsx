import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCaseStore } from '../store/caseStore';
import { useAuthStore } from '../store/authStore';
import { useNotifStore } from '../store/notifStore';
import { CasePriority } from '../types';
import {
  FolderKanban,
  Plus,
  Search,
} from 'lucide-react';

export const CasesPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { cases, createCase } = useCaseStore();
  const { currentUser } = useAuthStore();
  const { addNotification } = useNotifStore();

  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New Case Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [requestType, setRequestType] = useState<any>('PFZ Advisory Clarification');
  const [locationName, setLocationName] = useState('Kasimedu Fishing Jetty');
  const [priority, setPriority] = useState<CasePriority>('MEDIUM');

  const filteredCases = cases.filter((c) => {
    if (priorityFilter !== 'ALL' && c.priority !== priorityFilter) return false;
    if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        c.title.toLowerCase().includes(q) ||
        c.caseNumber.toLowerCase().includes(q) ||
        c.requesterName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCreateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    const newCase = await createCase({
      requesterName: currentUser.name,
      requesterContact: currentUser.phone || '+91 98401 23456',
      requesterRole: 'fisherman',
      requestType,
      title,
      description,
      locationName,
      coordinates: { lat: 13.125, lng: 80.298 },
      region: 'Tamil Nadu - Chennai',
      language: currentUser.preferredLanguage || 'en',
      priority,
      status: 'unassigned',
      slaDueTime: new Date(Date.now() + 4 * 3600 * 1000).toISOString(),
    });

    addNotification({
      type: 'case_assigned',
      title: `📝 New Case Registered: ${newCase.caseNumber}`,
      message: `Request registered for ${title}. Assigned to triage queue.`,
      severity: 'info',
      recipientRole: 'all',
    });

    setIsCreateModalOpen(false);
    setTitle('');
    setDescription('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-marine-900 via-marine-850 to-cyan-950/40 p-5 rounded-2xl border border-marine-750 shadow-hud">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-cyan-950 text-cyan-300 border border-cyan-800 rounded font-mono text-xs font-bold flex items-center gap-1.5">
              <FolderKanban className="w-3.5 h-3.5 text-cyan-400" />
              {t('nav.cases', 'Cases & Requests')}
            </span>
            <span className="text-xs text-slate-400 font-mono">End-to-End Maritime Lifecycle</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            {t('cases.title', 'Cases & Service Requests')}
          </h1>
          <p className="text-xs text-slate-300">
            {t('cases.subtitle', 'Submit, assign, track SLAs, and resolve marine advisory queries and operational support requests.')}
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-black font-extrabold text-xs rounded-xl shadow-glow-cyan flex items-center gap-2 transition"
        >
          <Plus className="w-4 h-4" />
          <span>{t('cases.newCase', 'New Service Request')}</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="marine-card rounded-2xl p-4 border border-marine-750 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('common.search', 'Search by case #, requester, or subject...')}
            className="w-full bg-marine-950 border border-marine-750 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="bg-marine-950 border border-marine-750 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
        >
          <option value="ALL">{t('tasks.priority', 'All Priorities')}</option>
          <option value="CRITICAL_SOS">Critical SOS</option>
          <option value="HIGH">High Priority</option>
          <option value="MEDIUM">Medium Priority</option>
          <option value="LOW">Low Priority</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-marine-950 border border-marine-750 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
        >
          <option value="ALL">{t('tasks.status', 'All Statuses')}</option>
          <option value="unassigned">Unassigned</option>
          <option value="assigned">Assigned</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">{t('cases.resolved', 'Resolved')}</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {/* Cases List */}
      <div className="space-y-4">
        {filteredCases.map((c) => (
          <div
            key={c.id}
            className="marine-card marine-card-hover rounded-2xl p-5 border border-marine-750 space-y-3 cursor-pointer"
            onClick={() => navigate(`/cases/${c.id}`)}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-marine-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-cyan-950 text-cyan-300 border border-cyan-800 rounded font-mono text-xs font-bold">
                  {c.caseNumber}
                </span>
                <span className="text-xs text-slate-400 font-mono">{c.requestType}</span>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold uppercase ${
                    c.priority === 'CRITICAL_SOS'
                      ? 'bg-red-500 text-white animate-pulse'
                      : c.priority === 'HIGH'
                      ? 'bg-amber-500 text-black'
                      : 'bg-marine-800 text-slate-300'
                  }`}
                >
                  {c.priority}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold uppercase ${
                    c.status === 'resolved' || c.status === 'closed'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                  }`}
                >
                  {c.status}
                </span>
              </div>
            </div>

            <h3 className="text-base font-bold text-white leading-snug">{c.title}</h3>
            <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">{c.description}</p>

            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 pt-2 border-t border-marine-800 font-mono">
              <div className="flex items-center gap-3">
                <span>Requester: <strong className="text-white">{c.requesterName}</strong></span>
                <span>Assigned Agent: <strong className="text-cyan-300">{c.assignedAgentName || 'Unassigned'}</strong></span>
              </div>
              <span className="text-cyan-400 font-semibold flex items-center gap-1">
                View Timeline & Comments ({c.comments.length}) →
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Create Case Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-marine-900 border border-marine-750 rounded-2xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Create New Marine Service Request</h3>

            <form onSubmit={handleCreateCase} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Request Category</label>
                <select
                  value={requestType}
                  onChange={(e) => setRequestType(e.target.value)}
                  className="w-full bg-marine-950 border border-marine-750 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="PFZ Advisory Clarification">PFZ Advisory Clarification</option>
                  <option value="Engine Breakdown Support">Engine Breakdown Support</option>
                  <option value="Harbour Clearance">Harbour Clearance</option>
                  <option value="Weather Hazard Report">Weather Hazard Report</option>
                  <option value="Gear Loss Claim">Gear Loss Claim</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Subject / Title *</label>
                <input
                  required
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Need waypoint bearing update for Tuna shoal"
                  className="w-full bg-marine-950 border border-marine-750 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Location / Port Jetty</label>
                <input
                  type="text"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  className="w-full bg-marine-950 border border-marine-750 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as CasePriority)}
                  className="w-full bg-marine-950 border border-marine-750 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL_SOS">Critical SOS</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Detailed Description *</label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide complete nautical coordinates, boat details, or clarification needs..."
                  className="w-full bg-marine-950 border border-marine-750 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 py-2 bg-marine-800 hover:bg-marine-750 text-slate-300 text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-cyan-600 hover:bg-cyan-500 text-black font-extrabold text-xs rounded-xl shadow-glow-cyan"
                >
                  Submit Service Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
