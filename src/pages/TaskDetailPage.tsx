import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCaseStore } from '../store/caseStore';
import { TaskStatus } from '../types';
import {
  ArrowLeft,
  FileText,
  Send,
} from 'lucide-react';

export const TaskDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { tasks, updateTaskStatus, addTaskNote } = useCaseStore();

  const task = tasks.find((t) => t.id === id) || tasks[0];
  const [noteInput, setNoteInput] = useState('');

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteInput.trim()) return;
    addTaskNote(task.id, noteInput);
    setNoteInput('');
  };

  return (
    <div className="space-y-6 pb-16 max-w-4xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-xs font-semibold text-cyan-400 hover:underline"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Tasks</span>
      </button>

      <div className="marine-card rounded-3xl p-6 md:p-8 border border-marine-750 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-marine-750 pb-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-cyan-950 text-cyan-300 border border-cyan-800 rounded font-mono text-xs font-bold">
                {task.taskId}
              </span>
              <span className="px-2.5 py-0.5 bg-marine-950 text-slate-300 border border-marine-750 rounded font-mono text-xs uppercase">
                {task.priority} Priority
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white">{task.title}</h1>
            <p className="text-xs text-slate-400 font-mono">
              Assigned Field Officer: <strong className="text-cyan-300">{task.agentName}</strong>
            </p>
          </div>

          <select
            value={task.status}
            onChange={(e) => updateTaskStatus(task.id, e.target.value as TaskStatus)}
            className="bg-marine-950 border border-cyan-700 text-cyan-300 rounded-xl px-3 py-2 text-xs font-bold font-mono focus:outline-none"
          >
            <option value="pending">PENDING</option>
            <option value="accepted">ACCEPTED</option>
            <option value="in_progress">IN PROGRESS</option>
            <option value="completed">COMPLETED</option>
          </select>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed bg-marine-950 p-4 rounded-2xl border border-marine-800">
          {task.description}
        </p>

        {/* Task Notes Log */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-cyan-400" />
            <span>Field Activity Log ({task.notes.length})</span>
          </h3>

          <div className="space-y-2 max-h-52 overflow-y-auto">
            {task.notes.map((note, idx) => (
              <div key={idx} className="p-3 bg-marine-950 border border-marine-800 rounded-xl text-xs text-slate-200">
                {note}
              </div>
            ))}
          </div>

          <form onSubmit={handleAddNote} className="flex gap-2">
            <input
              type="text"
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              placeholder="Log field update or photo confirmation..."
              className="flex-1 bg-marine-950 border border-marine-750 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-black font-bold text-xs rounded-xl shadow-glow-cyan flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Log Entry</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
