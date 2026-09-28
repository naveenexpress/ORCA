import React from 'react';
import {
  ArrowLeft,
  Navigation,
  Sparkles,
  FileCheck,
  ExternalLink,
} from 'lucide-react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { usePfzStore } from '../store/pfzStore';
import { useChatStore } from '../store/chatStore';
import { CompassBearing } from '../components/common/CompassBearing';
import { SafetyDisclaimer } from '../components/common/SafetyDisclaimer';

export const PfzDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { advisories } = usePfzStore();
  const { openChat, sendMessage } = useChatStore();

  const advisory = advisories.find((a) => a.id === id) || advisories[0];

  const handleAskAssistant = () => {
    openChat();
    sendMessage(`Explain the current fishing advisory, depth profile, and target species for ${advisory.name}`);
  };

  return (
    <div className="space-y-6 pb-16 max-w-5xl mx-auto">
      {/* Back Link */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-xs font-semibold text-cyan-400 hover:underline"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Advisories List</span>
      </button>

      {/* Main Title Sheet */}
      <div className="marine-card rounded-3xl p-6 md:p-8 border border-marine-750 shadow-2xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-marine-750 pb-5">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded font-mono text-xs font-bold">
                {advisory.confidence} CONFIDENCE
              </span>
              <span className="px-2.5 py-0.5 bg-marine-950 text-slate-300 border border-marine-750 rounded font-mono text-xs">
                {advisory.advisoryId}
              </span>
              <span className="px-2.5 py-0.5 bg-cyan-950 text-cyan-300 border border-cyan-800 rounded font-mono text-xs">
                Version {advisory.version}.0
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white">{advisory.name}</h1>
            <p className="text-xs text-slate-400 font-mono">
              Sector: <strong className="text-cyan-300">{advisory.sector}</strong> &bull; State: {advisory.state} ({advisory.region})
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to={`/map?focus=${advisory.id}`}
              className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-black font-extrabold text-xs rounded-xl shadow-glow-cyan transition flex items-center gap-2"
            >
              <Navigation className="w-4 h-4" />
              <span>View On Live Map</span>
            </Link>
            <button
              onClick={handleAskAssistant}
              className="px-4 py-2.5 bg-marine-800 hover:bg-marine-750 text-cyan-300 font-bold text-xs rounded-xl border border-cyan-900 transition flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Ask AI Assistant</span>
            </button>
          </div>
        </div>

        {/* Compass & Navigation Telemetry */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <CompassBearing
            bearingDegrees={advisory.bearingDegrees}
            directionText={advisory.directionFromLandingCentre}
            distanceKm={advisory.distanceKm}
            distanceNM={advisory.distanceFromLandingCentre}
            landingCentreName={advisory.landingCentreName}
            size="lg"
          />

          <div className="grid grid-cols-2 gap-3 text-xs font-mono">
            <div className="p-3 bg-marine-950 border border-marine-750 rounded-xl space-y-0.5">
              <span className="text-[10px] text-slate-400">Bathymetric Depth</span>
              <p className="text-lg font-bold text-white">{advisory.depth} m</p>
              <p className="text-[10px] text-slate-400">({advisory.depthFathoms} fathoms)</p>
            </div>

            <div className="p-3 bg-marine-950 border border-marine-750 rounded-xl space-y-0.5">
              <span className="text-[10px] text-slate-400">Sea Surface Temp (SST)</span>
              <p className="text-lg font-bold text-amber-400">{advisory.seaSurfaceTemperature} °C</p>
              <p className="text-[10px] text-emerald-400">Thermal Front Detected</p>
            </div>

            <div className="p-3 bg-marine-950 border border-marine-750 rounded-xl space-y-0.5">
              <span className="text-[10px] text-slate-400">Chlorophyll Concentration</span>
              <p className="text-lg font-bold text-cyan-400">{advisory.chlorophyll} mg/m³</p>
              <p className="text-[10px] text-slate-400">Oceansat-3 Ocean Color</p>
            </div>

            <div className="p-3 bg-marine-950 border border-marine-750 rounded-xl space-y-0.5">
              <span className="text-[10px] text-slate-400">GPS Centroid Fix</span>
              <p className="text-xs font-bold text-white truncate">{advisory.latitude.toFixed(3)}°N</p>
              <p className="text-xs font-bold text-white truncate">{advisory.longitude.toFixed(3)}°E</p>
            </div>
          </div>
        </div>

        {/* Description & Target Species */}
        <div className="space-y-3 pt-2">
          <h3 className="text-sm font-bold text-white">Oceanographic Front Analysis</h3>
          <p className="text-xs text-slate-300 leading-relaxed">{advisory.description}</p>

          <div className="space-y-1.5 pt-2">
            <span className="text-xs font-bold text-slate-300">Target Pelagic Species:</span>
            <div className="flex flex-wrap gap-2">
              {advisory.targetSpecies.map((s) => (
                <span
                  key={s}
                  className="px-3 py-1 bg-marine-950 border border-cyan-800 rounded-xl text-xs font-semibold text-cyan-300"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Multilingual Localization Snippets if available */}
        {advisory.languageVariants && (
          <div className="p-4 bg-marine-950/80 border border-marine-750 rounded-2xl space-y-2 text-xs">
            <h4 className="font-bold text-slate-300">Regional Language Translations (Unicode):</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(advisory.languageVariants).map(([lang, val]) => (
                <div key={lang} className="p-3 bg-marine-900 rounded-xl space-y-1">
                  <span className="px-1.5 py-0.2 bg-marine-800 rounded text-[10px] font-mono uppercase text-cyan-400">
                    {lang}
                  </span>
                  <p className="font-bold text-white">{val.name}</p>
                  <p className="text-slate-300 text-[11px]">{val.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Source Citation & Audit Compliance Block */}
        <div className="p-4 bg-marine-950 border border-marine-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-slate-400 font-mono">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <FileCheck className="w-4 h-4" />
              <span>Published by: {advisory.source}</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Approved by: {advisory.approvedBy || 'INCOIS Automated Feed'} &bull; Published: {new Date(advisory.publishedAt).toLocaleString()}
            </p>
          </div>

          <a
            href={advisory.sourceUrlOrReference}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-cyan-400 hover:underline shrink-0"
          >
            <span>Verify on INCOIS Web GIS</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      <SafetyDisclaimer />
    </div>
  );
};
