import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCaseStore } from '../store/caseStore';
import { useAuthStore } from '../store/authStore';
import { CaseStatus } from '../types';
import {
  ArrowLeft,
  MessageSquare,
  Send,
} from 'lucide-react';

export const CaseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { cases, addCaseComment, updateCaseStatus } = useCaseStore();
  const { currentUser } = useAuthStore();

  const caseItem = cases.find((c) => c.id === id) || cases[0];
  const [commentText, setCommentText] = useState('');

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addCaseComment(caseItem.id, currentUser.id, currentUser.name, currentUser.role, commentText);
    setCommentText('');
  };

  return (
    <div className="space-y-6 pb-16 max-w-4xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-xs font-semibold text-cyan-400 hover:underline"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Case Queue</span>
      </button>

      {/* Main Case Sheet */}
      <div className="marine-card rounded-3xl p-6 md:p-8 border border-marine-750 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-marine-750 pb-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-cyan-950 text-cyan-300 border border-cyan-800 rounded font-mono text-xs font-bold">
                {caseItem.caseNumber}
              </span>
              <span className="px-2.5 py-0.5 bg-marine-950 text-slate-300 border border-marine-750 rounded font-mono text-xs">
                {caseItem.requestType}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white">{caseItem.title}</h1>
            <p className="text-xs text-slate-400 font-mono">
              Requester: <strong className="text-white">{caseItem.requesterName}</strong> ({caseItem.requesterContact})
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={caseItem.status}
              onChange={(e) => updateCaseStatus(caseItem.id, e.target.value as CaseStatus)}
              className="bg-marine-950 border border-cyan-700 text-cyan-300 rounded-xl px-3 py-2 text-xs font-bold font-mono focus:outline-none"
            >
              <option value="unassigned">UNASSIGNED</option>
              <option value="assigned">ASSIGNED</option>
              <option value="in_progress">IN PROGRESS</option>
              <option value="resolved">RESOLVED</option>
              <option value="closed">CLOSED</option>
            </select>
          </div>
        </div>

        {/* Telemetry & SLA Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-3 bg-marine-950 border border-marine-750 rounded-xl">
            <span className="text-[10px] text-slate-400">Priority</span>
            <p className="text-sm font-bold text-amber-400">{caseItem.priority}</p>
          </div>
          <div className="p-3 bg-marine-950 border border-marine-750 rounded-xl">
            <span className="text-[10px] text-slate-400">Location</span>
            <p className="text-sm font-bold text-white truncate">{caseItem.locationName}</p>
          </div>
          <div className="p-3 bg-marine-950 border border-marine-750 rounded-xl">
            <span className="text-[10px] text-slate-400">Assigned Agent</span>
            <p className="text-sm font-bold text-cyan-300 truncate">{caseItem.assignedAgentName || 'Unassigned'}</p>
          </div>
          <div className="p-3 bg-marine-950 border border-marine-750 rounded-xl">
            <span className="text-[10px] text-slate-400">SLA Due Time</span>
            <p className="text-sm font-bold text-white">{new Date(caseItem.slaDueTime).toLocaleTimeString()}</p>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-white">Request Description</h3>
          <p className="text-xs text-slate-300 leading-relaxed bg-marine-950 p-4 rounded-2xl border border-marine-800">
            {caseItem.description}
          </p>
        </div>

        {/* Comments & Activity Stream */}
        <div className="space-y-4 pt-2">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-cyan-400" />
            <span>Activity Log & Field Notes ({caseItem.comments.length})</span>
          </h3>

          <div className="space-y-3 max-h-60 overflow-y-auto">
            {caseItem.comments.map((comment) => (
              <div key={comment.id} className="p-3.5 bg-marine-950 border border-marine-800 rounded-2xl space-y-1 text-xs">
                <div className="flex items-center justify-between text-slate-400 font-mono text-[11px]">
                  <span className="font-bold text-cyan-300">{comment.authorName} ({comment.authorRole})</span>
                  <span>{new Date(comment.createdAt).toLocaleTimeString()}</span>
                </div>
                <p className="text-slate-200 font-sans">{comment.text}</p>
              </div>
            ))}
          </div>

          {/* Add Comment Box */}
          <form onSubmit={handleAddComment} className="flex gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write an operational note or status update..."
              className="flex-1 bg-marine-950 border border-marine-750 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-black font-bold text-xs rounded-xl shadow-glow-cyan flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Post Note</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
