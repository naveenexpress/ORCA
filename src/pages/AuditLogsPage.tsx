import React, { useState } from 'react';
import { History, Search } from 'lucide-react';
import { SEED_AUDIT_LOGS } from '../data/seedData';

export const AuditLogsPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');

  const filteredLogs = SEED_AUDIT_LOGS.filter((log) => {
    if (severityFilter !== 'ALL' && log.severity !== severityFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        log.action.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q) ||
        log.userName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-marine-900 via-marine-850 to-cyan-950/40 p-5 rounded-2xl border border-marine-750 shadow-hud">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-cyan-950 text-cyan-300 border border-cyan-800 rounded font-mono text-xs font-bold flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-cyan-400" />
              TAMPER-PROOF AUDIT TRAIL
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Security & Operations Audit Trail
          </h1>
          <p className="text-xs text-slate-300">
            Immutable log of all user logins, SOS transmissions, automated allocations, and supervisor overrides.
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
            placeholder="Search action, actor, or details..."
            className="w-full bg-marine-950 border border-marine-750 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="bg-marine-950 border border-marine-750 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
        >
          <option value="ALL">All Severities</option>
          <option value="CRITICAL">Critical</option>
          <option value="WARNING">Warning</option>
          <option value="INFO">Info</option>
        </select>
      </div>

      {/* Logs Table */}
      <div className="marine-card rounded-2xl border border-marine-750 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-marine-950 text-slate-400 font-mono uppercase text-[10px] border-b border-marine-800">
              <tr>
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5">Action</th>
                <th className="p-3.5">Actor</th>
                <th className="p-3.5">Resource</th>
                <th className="p-3.5">Details</th>
                <th className="p-3.5">Severity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-marine-800 font-mono text-slate-300">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-marine-800/40 transition">
                  <td className="p-3.5 text-slate-400 text-[11px] whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="p-3.5 text-cyan-300 font-bold whitespace-nowrap">{log.action}</td>
                  <td className="p-3.5 text-white whitespace-nowrap">
                    {log.userName} ({log.userRole})
                  </td>
                  <td className="p-3.5 text-slate-400 whitespace-nowrap">{log.resourceType}</td>
                  <td className="p-3.5 font-sans text-slate-200 text-xs max-w-xs">{log.details}</td>
                  <td className="p-3.5 whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.severity === 'CRITICAL'
                          ? 'bg-red-950 text-red-400 border border-red-800'
                          : log.severity === 'WARNING'
                          ? 'bg-amber-950 text-amber-400 border border-amber-800'
                          : 'bg-marine-950 text-emerald-400 border border-emerald-800'
                      }`}
                    >
                      {log.severity}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
