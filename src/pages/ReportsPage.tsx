import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  BarChart3,
  Download,
  CheckCircle,
} from 'lucide-react';

const MONTHLY_METRICS = [
  { month: 'Apr 2026', publishedPfz: 42, resolvedCases: 110, sarResponses: 4 },
  { month: 'May 2026', publishedPfz: 48, resolvedCases: 135, sarResponses: 6 },
  { month: 'Jun 2026', publishedPfz: 35, resolvedCases: 95, sarResponses: 8 },
  { month: 'Jul 2026', publishedPfz: 52, resolvedCases: 140, sarResponses: 3 },
  { month: 'Aug 2026', publishedPfz: 58, resolvedCases: 162, sarResponses: 5 },
  { month: 'Sep 2026', publishedPfz: 60, resolvedCases: 175, sarResponses: 4 },
];

export const ReportsPage: React.FC = () => {
  const { t } = useTranslation();
  const [downloadMsg, setDownloadMsg] = useState<string | null>(null);

  const handleExportSummaryCsv = () => {
    const csv = 'Month,Published_PFZs,Resolved_Cases,SAR_Responses\n' +
      MONTHLY_METRICS.map((m) => `${m.month},${m.publishedPfz},${m.resolvedCases},${m.sarResponses}`).join('\n');
    const uri = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
    const link = document.createElement('a');
    link.href = uri;
    link.download = 'ORCA_Operational_Report_Summary.csv';
    link.click();
    setDownloadMsg('Summary CSV Report downloaded successfully.');
    setTimeout(() => setDownloadMsg(null), 3000);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-marine-900 via-marine-850 to-cyan-950/40 p-5 rounded-2xl border border-marine-750 shadow-hud">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-cyan-950 text-cyan-300 border border-cyan-800 rounded font-mono text-xs font-bold flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
              {t('nav.reports', 'Reports & Analytics')}
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            {t('reports.title', 'Marine Operational Reports & Analytics')}
          </h1>
          <p className="text-xs text-slate-300">
            {t('reports.subtitle', 'Advisory density, SAR rescue response SLAs, and field agent performance statistics.')}
          </p>
        </div>

        <button
          onClick={handleExportSummaryCsv}
          className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-black font-extrabold text-xs rounded-xl shadow-glow-cyan flex items-center gap-2 transition"
        >
          <Download className="w-4 h-4" />
          <span>{t('reports.exportReport', 'Export Monthly Report')}</span>
        </button>
      </div>

      {downloadMsg && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs rounded-xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{downloadMsg}</span>
        </div>
      )}

      {/* Chart */}
      <div className="marine-card rounded-2xl p-5 border border-marine-750 space-y-4">
        <h3 className="text-sm font-bold text-white">Monthly Marine Advisory & Case Throughput</h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={MONTHLY_METRICS}>
              <CartesianGrid strokeDasharray="3 3" stroke="#152953" />
              <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip contentStyle={{ backgroundColor: '#0b152d', borderColor: '#1e3a8a', borderRadius: '0.75rem' }} />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Bar dataKey="publishedPfz" name="PFZs Published" fill="#38bdf8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="resolvedCases" name="Resolved Cases" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="sarResponses" name="SAR SOS Incidents" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
