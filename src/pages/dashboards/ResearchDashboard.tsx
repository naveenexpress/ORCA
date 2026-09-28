import React, { useState } from 'react';
import {
  Microscope,
  Download,
  FileSpreadsheet,
  CheckCircle,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  XAxis,
  YAxis,
} from 'recharts';
import { useTranslation } from 'react-i18next';
import { usePfzStore } from '../../store/pfzStore';

// Mock Oceanographic Time Series Data
const SST_CHLOROPHYLL_TIMESERIES = [
  { time: '00:00', sst: 28.1, chlorophyll: 1.15, pelagicYieldKg: 680 },
  { time: '04:00', sst: 27.8, chlorophyll: 1.15, pelagicYieldKg: 680 },
  { time: '08:00', sst: 28.4, chlorophyll: 1.42, pelagicYieldKg: 950 },
  { time: '12:00', sst: 29.2, chlorophyll: 1.28, pelagicYieldKg: 820 },
  { time: '16:00', sst: 28.9, chlorophyll: 1.10, pelagicYieldKg: 710 },
  { time: '20:00', sst: 28.3, chlorophyll: 1.35, pelagicYieldKg: 890 },
];

const VALIDATION_ACCURACY_BY_SECTOR = [
  { sector: 'Coromandel North', predicted: 100, validated: 92, accuracyPercent: 92 },
  { sector: 'Mahabalipuram', predicted: 85, validated: 78, accuracyPercent: 91.7 },
  { sector: 'Visakhapatnam', predicted: 110, validated: 104, accuracyPercent: 94.5 },
  { sector: 'Malabar Upwelling', predicted: 130, validated: 122, accuracyPercent: 93.8 },
  { sector: 'Saurashtra Coast', predicted: 140, validated: 131, accuracyPercent: 93.5 },
  { sector: 'Mahanadi Delta', predicted: 75, validated: 68, accuracyPercent: 90.6 },
];

const DEPTH_YIELD_PROFILE = [
  { depthRange: '10-25m', tuna: 120, mackerel: 450, squid: 210 },
  { depthRange: '25-40m', tuna: 380, mackerel: 620, squid: 430 },
  { depthRange: '40-60m', tuna: 790, mackerel: 410, squid: 680 },
  { depthRange: '60-80m', tuna: 920, mackerel: 180, squid: 520 },
  { depthRange: '80-120m', tuna: 640, mackerel: 80, squid: 290 },
];

export const ResearchDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { advisories } = usePfzStore();
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const handleExportCsv = () => {
    const headers = ['AdvisoryID', 'Name', 'Region', 'State', 'Depth_M', 'SST_C', 'Chlorophyll_mg_m3', 'Confidence', 'TargetSpecies'];
    const rows = advisories.map((a) => [
      a.advisoryId,
      `"${a.name}"`,
      a.region,
      a.state,
      a.depth,
      a.seaSurfaceTemperature,
      a.chlorophyll,
      a.confidence,
      `"${a.targetSpecies.join('; ')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ORCA_PFZ_Research_Dataset_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportNotice('CSV Dataset successfully exported.');
    setTimeout(() => setExportNotice(null), 3500);
  };

  const handleExportGeoJson = () => {
    const geojson = {
      type: 'FeatureCollection',
      features: advisories.map((a) => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [a.longitude, a.latitude],
        },
        properties: {
          id: a.id,
          advisoryId: a.advisoryId,
          name: a.name,
          depth: a.depth,
          sst: a.seaSurfaceTemperature,
          chlorophyll: a.chlorophyll,
          confidence: a.confidence,
          validUntil: a.validUntil,
        },
      })),
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(geojson, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `ORCA_PFZ_Spatial_Features_${new Date().toISOString().slice(0, 10)}.geojson`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setExportNotice('GeoJSON Spatial Features successfully exported.');
    setTimeout(() => setExportNotice(null), 3500);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#F4FAFD] to-[#E8F8FB] p-5 rounded-2xl border border-[#CFE6EF] shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-[#E8F8FB] text-[#1769AA] border border-[#CFE6EF] rounded font-mono text-xs font-bold flex items-center gap-1.5">
              <Microscope className="w-3.5 h-3.5 text-[#168DCC]" />
              NIOT / INCOIS SPATIAL INTELLIGENCE GRID
            </span>
            <span className="text-xs text-[#7890A5] font-mono">Satellite Radiometry & Bio-Optics</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#123B6D] tracking-tight">
            🔬 {t('dashboards.researchTitle', 'Oceanographic & Marine Intelligence Workbench')}
          </h1>
          <p className="text-xs text-[#55718D]">
            Ocean thermal fronts, chlorophyll-a plumes, depth-yield correlations, and ground-truth validation analytics.
          </p>
        </div>

        {/* Dataset Export Tools */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-[#E8F8FB] border border-[#BFD6E4] text-[#123B6D] font-bold text-xs rounded-xl shadow-sm transition"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#24A978]" />
            <span>Export CSV Dataset</span>
          </button>
          <button
            onClick={handleExportGeoJson}
            className="flex items-center gap-2 px-3.5 py-2 bg-[#1769AA] hover:bg-[#123B6D] text-white font-bold text-xs rounded-xl shadow-sm transition"
          >
            <Download className="w-4 h-4" />
            <span>Export GeoJSON Layers</span>
          </button>
        </div>
      </div>

      {exportNotice && (
        <div className="p-3 bg-[#EAF8F1] border border-[#BFE7D1] text-[#16845F] text-xs rounded-xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-[#24A978]" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-[#D7E7F0] shadow-sm space-y-1">
          <span className="text-[10px] font-mono uppercase text-[#55718D]">Total Active PFZs</span>
          <p className="text-2xl font-extrabold text-[#123B6D] font-mono">{advisories.length}</p>
          <p className="text-[11px] text-[#24A978] font-mono">Across 8 Coastal States</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#D7E7F0] shadow-sm space-y-1">
          <span className="text-[10px] font-mono uppercase text-[#55718D]">Avg SST Thermal Gradient</span>
          <p className="text-2xl font-extrabold text-[#E7A928] font-mono">27.9 °C</p>
          <p className="text-[11px] text-[#7890A5] font-mono">ΔT = 1.4°C Frontal Shear</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#D7E7F0] shadow-sm space-y-1">
          <span className="text-[10px] font-mono uppercase text-[#55718D]">Mean Chlorophyll-a</span>
          <p className="text-2xl font-extrabold text-[#168DCC] font-mono">1.28 mg/m³</p>
          <p className="text-[11px] text-[#19B7C9] font-mono">Oceansat-3 High Productivity</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#D7E7F0] shadow-sm space-y-1">
          <span className="text-[10px] font-mono uppercase text-[#55718D]">Ground Truth Validation</span>
          <p className="text-2xl font-extrabold text-[#24A978] font-mono">93.2%</p>
          <p className="text-[11px] text-[#7890A5] font-mono">Catch Yield Accuracy</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: SST vs Chlorophyll vs Yield */}
        <div className="bg-white rounded-2xl p-5 border border-[#D7E7F0] shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#D7E7F0] pb-2.5">
            <div>
              <h3 className="text-sm font-bold text-[#123B6D]">SST vs Chlorophyll Bio-Optic Correlation</h3>
              <p className="text-[11px] text-[#55718D]">24-Hour Diurnal Thermal Front Dynamics</p>
            </div>
            <span className="px-2 py-0.5 bg-[#E8F8FB] text-[#1769AA] border border-[#CFE6EF] rounded text-[10px] font-mono">
              MODIS / VIIRS
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={SST_CHLOROPHYLL_TIMESERIES}>
                <CartesianGrid strokeDasharray="3 3" stroke="#D7E7F0" />
                <XAxis dataKey="time" stroke="#7890A5" fontSize={11} />
                <YAxis yAxisId="left" stroke="#1769AA" fontSize={11} domain={[26, 31]} />
                <YAxis yAxisId="right" orientation="right" stroke="#24A978" fontSize={11} domain={[0.5, 2.0]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#D7E7F0', color: '#123B6D', borderRadius: '0.75rem', boxShadow: '0 4px 18px rgba(18, 59, 109, 0.08)' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#123B6D' }} />
                <Line yAxisId="left" type="monotone" dataKey="sst" name="SST (°C)" stroke="#E7A928" strokeWidth={2.5} dot={{ r: 4 }} />
                <Line yAxisId="right" type="monotone" dataKey="chlorophyll" name="Chlorophyll-a (mg/m³)" stroke="#24A978" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Depth vs Species Catch Abundance */}
        <div className="bg-white rounded-2xl p-5 border border-[#D7E7F0] shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#D7E7F0] pb-2.5">
            <div>
              <h3 className="text-sm font-bold text-[#123B6D]">Bathymetric Catch Abundance by Species</h3>
              <p className="text-[11px] text-[#55718D]">Yield Profiles Across 10m to 120m Isobaths</p>
            </div>
            <span className="px-2 py-0.5 bg-[#E8F8FB] text-[#1769AA] border border-[#CFE6EF] rounded text-[10px] font-mono">
              INCOIS CATCH LOGS
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DEPTH_YIELD_PROFILE}>
                <CartesianGrid strokeDasharray="3 3" stroke="#D7E7F0" />
                <XAxis dataKey="depthRange" stroke="#7890A5" fontSize={11} />
                <YAxis stroke="#7890A5" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#D7E7F0', color: '#123B6D', borderRadius: '0.75rem', boxShadow: '0 4px 18px rgba(18, 59, 109, 0.08)' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#123B6D' }} />
                <Bar dataKey="tuna" name="Tuna (kg)" fill="#168DCC" radius={[4, 4, 0, 0]} />
                <Bar dataKey="mackerel" name="Mackerel (kg)" fill="#24A978" radius={[4, 4, 0, 0]} />
                <Bar dataKey="squid" name="Squid (kg)" fill="#19B7C9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Sector Ground Truth Accuracy */}
        <div className="bg-white rounded-2xl p-5 border border-[#D7E7F0] shadow-sm space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-[#D7E7F0] pb-2.5">
            <div>
              <h3 className="text-sm font-bold text-[#123B6D]">Advisory Validation Accuracy by Maritime Sector</h3>
              <p className="text-[11px] text-[#55718D]">Predicted PFZ High-Yield vs Harbor Landing Ground Truth Reports</p>
            </div>
            <span className="px-2 py-0.5 bg-[#EAF8F1] text-[#16845F] border border-[#BFE7D1] rounded text-[10px] font-mono">
              AUDIT COMPLIANT
            </span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={VALIDATION_ACCURACY_BY_SECTOR}>
                <CartesianGrid strokeDasharray="3 3" stroke="#D7E7F0" />
                <XAxis dataKey="sector" stroke="#7890A5" fontSize={11} />
                <YAxis stroke="#7890A5" fontSize={11} domain={[80, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#D7E7F0', color: '#123B6D', borderRadius: '0.75rem', boxShadow: '0 4px 18px rgba(18, 59, 109, 0.08)' }}
                />
                <Area type="monotone" dataKey="accuracyPercent" name="Accuracy (%)" stroke="#24A978" fill="#24A978" fillOpacity={0.15} strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
