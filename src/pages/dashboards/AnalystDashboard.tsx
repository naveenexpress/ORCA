import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  BarChart3,
  TrendingUp,
  PieChart as PieIcon,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const SPECIES_DEMAND_SHARE = [
  { name: 'Yellowfin Tuna', value: 38, color: '#38bdf8' },
  { name: 'Indian Mackerel', value: 24, color: '#10b981' },
  { name: 'Silver Pomfret', value: 18, color: '#a855f7' },
  { name: 'Loligo Squid', value: 12, color: '#f59e0b' },
  { name: 'Penaeid Shrimp', value: 8, color: '#ef4444' },
];

const REGIONAL_ACTIVITY_TREND = [
  { region: 'Tamil Nadu', activePfz: 4, cases: 14, fleetCount: 2090 },
  { region: 'Andhra Pradesh', activePfz: 3, cases: 11, fleetCount: 1950 },
  { region: 'Kerala', activePfz: 2, cases: 8, fleetCount: 980 },
  { region: 'Gujarat', activePfz: 2, cases: 9, fleetCount: 6000 },
  { region: 'Odisha', activePfz: 1, cases: 5, fleetCount: 950 },
];

export const AnalystDashboard: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#F4FAFD] to-[#E8F8FB] p-5 rounded-2xl border border-[#CFE6EF] shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-[#E8F8FB] text-[#1769AA] border border-[#CFE6EF] rounded font-mono text-xs font-bold flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5 text-[#168DCC]" />
              MARINE SPATIAL ANALYTICS CELL
            </span>
            <span className="text-xs text-[#7890A5] font-mono">Fisheries Economics & Yield Trends</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#123B6D] tracking-tight">
            📊 {t('dashboards.analystTitle', 'Spatial Analytics & Fishery Trends Analysis')}
          </h1>
          <p className="text-xs text-[#55718D]">
            Regional fleet distribution, pelagic species demand, advisory utilization rates, and operational SLA trends.
          </p>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Regional Activity Chart */}
        <div className="bg-white rounded-2xl p-5 border border-[#D7E7F0] shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-[#123B6D] flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#1769AA]" />
            <span>Regional Marine Activity & Advisory Density</span>
          </h3>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={REGIONAL_ACTIVITY_TREND}>
                <CartesianGrid strokeDasharray="3 3" stroke="#D7E7F0" />
                <XAxis dataKey="region" stroke="#7890A5" fontSize={11} />
                <YAxis stroke="#7890A5" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#D7E7F0', color: '#123B6D', borderRadius: '0.75rem', boxShadow: '0 4px 18px rgba(18, 59, 109, 0.08)' }} />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#123B6D' }} />
                <Bar dataKey="activePfz" name="Active PFZs" fill="#168DCC" radius={[4, 4, 0, 0]} />
                <Bar dataKey="cases" name="Service Cases" fill="#24A978" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Species Catch Share Pie */}
        <div className="bg-white rounded-2xl p-5 border border-[#D7E7F0] shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-[#123B6D] flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-[#1769AA]" />
            <span>Target Species Pelagic Aggregation Share</span>
          </h3>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={SPECIES_DEMAND_SHARE}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {SPECIES_DEMAND_SHARE.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#D7E7F0', color: '#123B6D', borderRadius: '0.75rem', boxShadow: '0 4px 18px rgba(18, 59, 109, 0.08)' }} />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#123B6D' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
