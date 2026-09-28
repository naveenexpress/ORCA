import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Server,
  History,
  Database,
} from 'lucide-react';
import { SEED_AUDIT_LOGS } from '../../data/seedData';
import { Link } from 'react-router-dom';

export const AdminDashboard: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#F4FAFD] to-[#E8F8FB] p-5 rounded-2xl border border-[#CFE6EF] shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-[#EAF8F1] text-[#16845F] border border-[#BFE7D1] rounded font-mono text-xs font-bold flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-[#24A978]" />
              SYSTEM HEALTH 99.98%
            </span>
            <span className="text-xs text-[#7890A5] font-mono">ORCA Core Enterprise Node</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#123B6D] tracking-tight">
            🛡️ {t('dashboards.adminTitle', 'ORCA System Health & Security Administration')}
          </h1>
          <p className="text-xs text-[#55718D]">
            System uptime, GIS data source ingestion feeds, RBAC governance, and tamper-proof audit trails.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/audit-logs"
            className="px-3.5 py-2 bg-white hover:bg-[#E8F8FB] border border-[#BFD6E4] text-[#123B6D] font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition"
          >
            <History className="w-4 h-4 text-[#1769AA]" />
            <span>Audit Trail</span>
          </Link>
          <Link
            to="/data-sources"
            className="px-3.5 py-2 bg-[#1769AA] hover:bg-[#123B6D] text-white font-extrabold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition"
          >
            <Database className="w-4 h-4" />
            <span>GIS Ingest Feeds</span>
          </Link>
        </div>
      </div>

      {/* System Health Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-[#D7E7F0] shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-[#55718D] text-xs font-mono">
            <span>INCOIS API FEED</span>
            <span className="text-[#24A978] flex items-center gap-1 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#24A978] animate-ping" />
              HEALTHY
            </span>
          </div>
          <p className="text-xl font-bold text-[#123B6D] font-mono">42 ms latency</p>
          <p className="text-[11px] text-[#7890A5]">Next poll: 12 mins</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#D7E7F0] shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-[#55718D] text-xs font-mono">
            <span>DATABASE / POSTGIS</span>
            <span className="text-[#24A978] font-bold">OPTIMAL</span>
          </div>
          <p className="text-xl font-bold text-[#123B6D] font-mono">1.2 GB Indexed</p>
          <p className="text-[11px] text-[#1769AA]">Spatial index active</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#D7E7F0] shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-[#55718D] text-xs font-mono">
            <span>OFFLINE QUEUE SYNC</span>
            <span className="text-[#1769AA] font-bold">READY</span>
          </div>
          <p className="text-xl font-bold text-[#1769AA] font-mono">0 Conflict Failures</p>
          <p className="text-[11px] text-[#7890A5]">IndexedDB Engine</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#D7E7F0] shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-[#55718D] text-xs font-mono">
            <span>SECURITY / RBAC</span>
            <span className="text-[#24A978] font-bold">LOCKED</span>
          </div>
          <p className="text-xl font-bold text-[#123B6D] font-mono">7 Demo Roles</p>
          <p className="text-[11px] text-[#7890A5]">Zero policy violations</p>
        </div>
      </div>

      {/* Main Admin Directorate Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: GIS Ingestion Feeds */}
        <div className="bg-white rounded-2xl p-5 border border-[#D7E7F0] shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-[#123B6D] flex items-center gap-2">
            <Database className="w-4 h-4 text-[#1769AA]" />
            <span>Operational GIS & Remote Sensing Data Feeds</span>
          </h3>

          <div className="space-y-2.5 text-xs">
            <div className="p-3 bg-[#F4FAFD] border border-[#D7E7F0] rounded-xl flex items-center justify-between">
              <div>
                <h4 className="font-bold text-[#123B6D]">INCOIS PFZ Composite Advisory Feed</h4>
                <p className="text-[#55718D] text-[11px]">Oceanic fronts & chlorophyll gradients (Oceansat-3/MODIS)</p>
              </div>
              <span className="px-2 py-0.5 bg-[#EAF8F1] text-[#16845F] border border-[#BFE7D1] rounded font-mono text-[10px] font-bold">
                CONNECTED
              </span>
            </div>

            <div className="p-3 bg-[#F4FAFD] border border-[#D7E7F0] rounded-xl flex items-center justify-between">
              <div>
                <h4 className="font-bold text-[#123B6D]">IMD Marine Weather & Cyclone Warning Feed</h4>
                <p className="text-[#55718D] text-[11px]">Doppler radar squalls, wind velocity, swell heights</p>
              </div>
              <span className="px-2 py-0.5 bg-[#EAF8F1] text-[#16845F] border border-[#BFE7D1] rounded font-mono text-[10px] font-bold">
                CONNECTED
              </span>
            </div>

            <div className="p-3 bg-[#F4FAFD] border border-[#D7E7F0] rounded-xl flex items-center justify-between">
              <div>
                <h4 className="font-bold text-[#123B6D]">Indian Coast Guard MRCC SAR Dispatch Bridge</h4>
                <p className="text-[#55718D] text-[11px]">Emergency distress routing & vessel telemetry</p>
              </div>
              <span className="px-2 py-0.5 bg-[#EAF8F1] text-[#16845F] border border-[#BFE7D1] rounded font-mono text-[10px] font-bold">
                CONNECTED
              </span>
            </div>
          </div>
        </div>

        {/* Right: Security & Operational Audit Log */}
        <div className="bg-white rounded-2xl p-5 border border-[#D7E7F0] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#123B6D] flex items-center gap-2">
              <History className="w-4 h-4 text-[#1769AA]" />
              <span>Real-Time Tamper-Proof Audit Trail</span>
            </h3>
            <Link to="/audit-logs" className="text-xs text-[#1769AA] hover:underline font-semibold">
              View All Logs →
            </Link>
          </div>

          <div className="space-y-2.5 divide-y divide-[#D7E7F0] max-h-72 overflow-y-auto">
            {SEED_AUDIT_LOGS.map((log) => (
              <div key={log.id} className="pt-2 text-xs space-y-1">
                <div className="flex items-center justify-between font-mono text-[11px]">
                  <span className="font-bold text-[#1769AA]">{log.action}</span>
                  <span className="text-[#7890A5]">{new Date(log.timestamp).toLocaleTimeString()}</span>
                </div>
                <p className="text-[#55718D] font-sans text-[11px]">{log.details}</p>
                <div className="flex items-center justify-between text-[10px] text-[#7890A5] font-mono">
                  <span>Actor: {log.userName} ({log.userRole})</span>
                  <span>IP: {log.ipAddress}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
