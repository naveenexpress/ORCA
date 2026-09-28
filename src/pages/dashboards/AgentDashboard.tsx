import React, { useState } from 'react';
import {
  CheckSquare,
  Clock,
  MapPin,
  WifiOff,
  Navigation,
  AlertTriangle,
  FileText,
} from 'lucide-react';
import { useAgentStore } from '../../store/agentStore';
import { useCaseStore } from '../../store/caseStore';
import { useOfflineStore } from '../../store/offlineStore';
import { useSosStore } from '../../store/sosStore';
import { TaskStatus } from '../../types';
import { Link } from 'react-router-dom';

export const AgentDashboard: React.FC = () => {
  const { tasks, updateTaskStatus, addTaskNote } = useCaseStore();
  const { agents, updateAgentLocation } = useAgentStore();
  const { isOnline, pendingMutations, syncPendingMutations, queueMutation } = useOfflineStore();
  const { incidents } = useSosStore();

  const currentAgent = agents.find((a) => a.id === 'agt-chn-01') || agents[0];
  const [activeTaskTab, setActiveTaskTab] = useState<'all' | 'in_progress' | 'completed'>('all');
  const [gpsTracking, setGpsTracking] = useState(currentAgent.gpsConsent);
  const [taskNoteInput, setTaskNoteInput] = useState<{ [taskId: string]: string }>({});

  const agentTasks = tasks.filter((t) => t.agentId === currentAgent.id || true);
  const displayedTasks = agentTasks.filter((t) => {
    if (activeTaskTab === 'in_progress') return t.status === 'in_progress' || t.status === 'accepted';
    if (activeTaskTab === 'completed') return t.status === 'completed';
    return true;
  });

  const handleStatusUpdate = (taskId: string, newStatus: TaskStatus) => {
    updateTaskStatus(taskId, newStatus);
    if (!isOnline) {
      queueMutation('UPDATE_TASK', { taskId, status: newStatus });
    }
  };

  const handleAddNote = (taskId: string) => {
    const note = taskNoteInput[taskId];
    if (!note || !note.trim()) return;
    addTaskNote(taskId, note);
    setTaskNoteInput((prev) => ({ ...prev, [taskId]: '' }));
    if (!isOnline) {
      queueMutation('UPDATE_TASK', { taskId, note });
    }
  };

  const handleToggleGps = () => {
    setGpsTracking(!gpsTracking);
    if (!gpsTracking) {
      updateAgentLocation(currentAgent.id, 13.1252, 80.2986);
    }
  };

  const activeSosIncidents = incidents.filter((i) => i.status === 'responding' || i.status === 'assigned');

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#F4FAFD] to-[#E8F8FB] p-5 rounded-2xl border border-[#CFE6EF] shadow-sm">
        <div className="flex items-center gap-4">
          <img
            src={currentAgent.avatar}
            alt={currentAgent.name}
            className="w-14 h-14 rounded-2xl border-2 border-[#19B7C9] object-cover shadow-sm"
          />
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-[#E8F8FB] text-[#1769AA] border border-[#CFE6EF] rounded font-mono text-[10px] font-bold">
                {currentAgent.badgeNumber}
              </span>
              <span className="text-xs text-[#24A978] font-mono flex items-center gap-1 font-bold">
                <span className="w-2 h-2 rounded-full bg-[#24A978] animate-ping" />
                {currentAgent.status.toUpperCase()}
              </span>
            </div>
            <h1 className="text-xl font-bold text-[#123B6D]">{currentAgent.name}</h1>
            <p className="text-xs text-[#55718D]">
              {currentAgent.organization} &bull; {currentAgent.baseLocationName}
            </p>
          </div>
        </div>

        {/* Offline & GPS Status Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleToggleGps}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition ${
              gpsTracking
                ? 'bg-[#E8F8FB] border-[#CFE6EF] text-[#1769AA] shadow-sm'
                : 'bg-white border-[#D7E7F0] text-[#7890A5]'
            }`}
          >
            <Navigation className={`w-3.5 h-3.5 ${gpsTracking ? 'text-[#1769AA] animate-spin' : ''}`} />
            <span>GPS Tracking: {gpsTracking ? 'Active (Live)' : 'Paused'}</span>
          </button>

          {pendingMutations.length > 0 && (
            <button
              onClick={syncPendingMutations}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#E7A928] hover:bg-[#d49822] text-white font-bold text-xs rounded-xl shadow-sm animate-pulse"
            >
              <WifiOff className="w-3.5 h-3.5" />
              <span>Sync {pendingMutations.length} Offline Actions</span>
            </button>
          )}
        </div>
      </div>

      {/* Emergency SOS Banner if Active */}
      {activeSosIncidents.length > 0 && (
        <div className="p-4 bg-[#FFF0F1] border border-[#FCDAD7] rounded-2xl flex items-center justify-between gap-3 shadow-sm animate-pulse">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#E5484D] rounded-xl text-white">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#123B6D]">
                🚨 CRITICAL SOS DISPATCH: {activeSosIncidents[0].emergencyType}
              </h4>
              <p className="text-xs text-[#E5484D] font-mono">
                Location: {activeSosIncidents[0].locationDescription} ({activeSosIncidents[0].peopleAffectedCount} souls)
              </p>
            </div>
          </div>
          <Link
            to={`/sos/${activeSosIncidents[0].id}`}
            className="px-3.5 py-1.5 bg-[#E5484D] hover:bg-[#d43d42] text-white font-bold text-xs rounded-xl shrink-0"
          >
            Respond Now →
          </Link>
        </div>
      )}

      {/* Main Agent Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Field Tasks Checklist */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-[#D7E7F0] shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#D7E7F0] pb-3">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-[#1769AA]" />
              <h3 className="font-bold text-[#123B6D] text-base">Assigned Field Tasks ({agentTasks.length})</h3>
            </div>

            {/* Filter Tabs */}
            <div className="flex bg-[#F4FAFD] p-1 rounded-xl border border-[#D7E7F0] text-xs font-semibold">
              <button
                onClick={() => setActiveTaskTab('all')}
                className={`px-3 py-1 rounded-lg transition ${
                  activeTaskTab === 'all' ? 'bg-[#1769AA] text-white font-bold' : 'text-[#55718D]'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setActiveTaskTab('in_progress')}
                className={`px-3 py-1 rounded-lg transition ${
                  activeTaskTab === 'in_progress' ? 'bg-[#1769AA] text-white font-bold' : 'text-[#55718D]'
                }`}
              >
                In Progress
              </button>
              <button
                onClick={() => setActiveTaskTab('completed')}
                className={`px-3 py-1 rounded-lg transition ${
                  activeTaskTab === 'completed' ? 'bg-[#1769AA] text-white font-bold' : 'text-[#55718D]'
                }`}
              >
                Completed
              </button>
            </div>
          </div>

          {/* Task Cards List */}
          <div className="space-y-4">
            {displayedTasks.map((task) => (
              <div
                key={task.id}
                className="p-4 bg-[#F4FAFD] border border-[#D7E7F0] rounded-2xl space-y-3 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-[#E8F8FB] text-[#1769AA] border border-[#CFE6EF] rounded font-mono text-[10px] font-bold">
                        {task.taskId}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                          task.priority === 'HIGH' ? 'bg-[#FFF0F1] text-[#E5484D] border border-[#FCDAD7]' : 'bg-white text-[#55718D] border border-[#D7E7F0]'
                        }`}
                      >
                        {task.priority}
                      </span>
                    </div>
                    <h4 className="font-bold text-[#123B6D] text-sm mt-1">{task.title}</h4>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold uppercase ${
                      task.status === 'completed'
                        ? 'bg-[#EAF8F1] text-[#16845F] border border-[#BFE7D1]'
                        : task.status === 'in_progress'
                        ? 'bg-[#E8F8FB] text-[#1769AA] border border-[#CFE6EF] animate-pulse'
                        : 'bg-[#FFF7E3] text-[#E7A928] border border-[#F0D98C]'
                    }`}
                  >
                    {task.status}
                  </span>
                </div>

                <p className="text-xs text-[#55718D] leading-relaxed">{task.description}</p>

                <div className="flex items-center gap-3 text-[11px] text-[#7890A5] font-mono">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#1769AA]" />
                    {task.locationName}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#E7A928]" />
                    Due: {new Date(task.dueTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* Task Notes Log */}
                {task.notes.length > 0 && (
                  <div className="p-2.5 bg-white border border-[#D7E7F0] rounded-xl space-y-1 text-xs">
                    <span className="text-[10px] font-mono text-[#7890A5] uppercase font-bold">Action History:</span>
                    {task.notes.map((n, idx) => (
                      <p key={idx} className="text-[#123B6D] font-sans pl-2 border-l-2 border-[#19B7C9] text-[11px]">
                        {n}
                      </p>
                    ))}
                  </div>
                )}

                {/* Add Note & Update Status */}
                {task.status !== 'completed' && (
                  <div className="pt-2 border-t border-[#D7E7F0] space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={taskNoteInput[task.id] || ''}
                        onChange={(e) => setTaskNoteInput({ ...taskNoteInput, [task.id]: e.target.value })}
                        placeholder="Log note, GPS reading, or photo confirmation..."
                        className="flex-1 bg-white border border-[#C9DDE8] rounded-xl px-3 py-1.5 text-xs text-[#123B6D] focus:outline-none focus:border-[#19B7C9]"
                      />
                      <button
                        onClick={() => handleAddNote(task.id)}
                        className="px-3 py-1.5 bg-[#1769AA] hover:bg-[#123B6D] text-white rounded-xl text-xs font-semibold"
                      >
                        Add Note
                      </button>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleStatusUpdate(task.id, 'in_progress')}
                        className="flex-1 py-1.5 bg-white border border-[#BFD6E4] hover:bg-[#E8F8FB] text-[#123B6D] font-bold text-xs rounded-xl transition"
                      >
                        Start Task
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(task.id, 'completed')}
                        className="flex-1 py-1.5 bg-[#24A978] hover:bg-[#1f9368] text-white font-bold text-xs rounded-xl shadow-sm transition"
                      >
                        Complete Task
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Performance & Area Status */}
        <div className="space-y-4">
          {/* Agent Workload & Performance Card */}
          <div className="bg-white rounded-2xl p-5 border border-[#D7E7F0] shadow-sm space-y-4">
            <h3 className="font-bold text-[#123B6D] text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#1769AA]" />
              <span>Agent Service Metrics</span>
            </h3>

            <div className="grid grid-cols-2 gap-2.5 text-xs font-mono">
              <div className="p-3 bg-[#F4FAFD] border border-[#D7E7F0] rounded-xl space-y-0.5">
                <span className="text-[10px] text-[#55718D] uppercase">Workload</span>
                <p className="text-base font-bold text-[#1769AA]">
                  {currentAgent.currentWorkload} / {currentAgent.maxWorkload}
                </p>
                <p className="text-[10px] text-[#24A978]">Available</p>
              </div>

              <div className="p-3 bg-[#F4FAFD] border border-[#D7E7F0] rounded-xl space-y-0.5">
                <span className="text-[10px] text-[#55718D] uppercase">Avg Response</span>
                <p className="text-base font-bold text-[#123B6D]">{currentAgent.performance.avgResponseMinutes} min</p>
                <p className="text-[10px] text-[#1769AA]">Top Tier</p>
              </div>

              <div className="p-3 bg-[#F4FAFD] border border-[#D7E7F0] rounded-xl space-y-0.5">
                <span className="text-[10px] text-[#55718D] uppercase">Resolution</span>
                <p className="text-base font-bold text-[#123B6D]">{currentAgent.performance.avgResolutionHours} hrs</p>
                <p className="text-[10px] text-[#7890A5]">Under SLA</p>
              </div>

              <div className="p-3 bg-[#F4FAFD] border border-[#D7E7F0] rounded-xl space-y-0.5">
                <span className="text-[10px] text-[#55718D] uppercase">User Rating</span>
                <p className="text-base font-bold text-[#E7A928]">{currentAgent.performance.rating} ★</p>
                <p className="text-[10px] text-[#7890A5]">148 Reviews</p>
              </div>
            </div>
          </div>

          {/* Languages & Skills */}
          <div className="bg-white rounded-2xl p-4 border border-[#D7E7F0] shadow-sm space-y-3 text-xs">
            <h4 className="font-bold text-[#123B6D]">Skills & Certifications</h4>
            <div className="flex flex-wrap gap-1.5">
              {currentAgent.skills.map((s) => (
                <span key={s} className="px-2 py-0.5 bg-[#F4FAFD] border border-[#D7E7F0] rounded text-[#55718D]">
                  {s}
                </span>
              ))}
            </div>

            <div className="pt-2 border-t border-[#D7E7F0] space-y-1">
              <span className="text-[#7890A5] text-[11px]">Certified Brevets:</span>
              <p className="text-[#1769AA] font-mono text-[11px]">{currentAgent.certifications.join(', ')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
