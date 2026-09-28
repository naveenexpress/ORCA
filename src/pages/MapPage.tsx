import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Sparkles, X } from 'lucide-react';
import { MarineMap } from '../components/map/MarineMap';
import { usePfzStore } from '../store/pfzStore';
import { useChatStore } from '../store/chatStore';
import { CompassBearing } from '../components/common/CompassBearing';
import { PfzAdvisory } from '../types';

export const MapPage: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const focusPfzId = searchParams.get('focus') || undefined;
  const { advisories } = usePfzStore();
  const { openChat, sendMessage } = useChatStore();

  const [selectedPfz, setSelectedPfz] = useState<PfzAdvisory | null>(
    focusPfzId ? advisories.find((a) => a.id === focusPfzId) || null : null
  );

  return (
    <div className="relative h-[calc(100vh-4.1rem)] w-full overflow-hidden flex">
      {/* Full Marine GIS Map */}
      <div className="flex-1 h-full relative">
        <MarineMap
          height="100%"
          focusAdvisoryId={focusPfzId}
          onSelectPfz={(pfz) => setSelectedPfz(pfz)}
        />
      </div>

      {/* Floating or Docked Side Details Drawer when a PFZ is selected */}
      {selectedPfz && (
        <div className="absolute right-4 top-4 bottom-4 z-30 w-80 sm:w-96 bg-marine-900/95 border border-marine-750 backdrop-blur-md rounded-2xl p-5 shadow-2xl overflow-y-auto space-y-4 animate-in slide-in-from-right">
          <div className="flex items-start justify-between gap-2 border-b border-marine-750 pb-3">
            <div>
              <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded font-mono text-[10px] font-bold">
                {selectedPfz.confidence} {t('map.confidence', 'CONFIDENCE')}
              </span>
              <h3 className="font-bold text-white text-base mt-1">{selectedPfz.name}</h3>
            </div>
            <button
              onClick={() => setSelectedPfz(null)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-marine-800"
              aria-label={t('common.close', 'Close')}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Compass & Bearing Component */}
          <CompassBearing
            bearingDegrees={selectedPfz.bearingDegrees}
            directionText={selectedPfz.directionFromLandingCentre}
            distanceKm={selectedPfz.distanceKm}
            distanceNM={selectedPfz.distanceFromLandingCentre}
            landingCentreName={selectedPfz.landingCentreName}
          />

          {/* Oceanographic Parameters */}
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-2.5 bg-marine-950 rounded-xl">
              <span className="text-[10px] text-slate-400">Depth</span>
              <p className="font-bold text-white">{selectedPfz.depth} m ({selectedPfz.depthFathoms} fathoms)</p>
            </div>
            <div className="p-2.5 bg-marine-950 rounded-xl">
              <span className="text-[10px] text-slate-400">SST</span>
              <p className="font-bold text-amber-400">{selectedPfz.seaSurfaceTemperature} °C</p>
            </div>
            <div className="p-2.5 bg-marine-950 rounded-xl">
              <span className="text-[10px] text-slate-400">Chlorophyll</span>
              <p className="font-bold text-cyan-400">{selectedPfz.chlorophyll} mg/m³</p>
            </div>
            <div className="p-2.5 bg-marine-950 rounded-xl">
              <span className="text-[10px] text-slate-400">Sector</span>
              <p className="font-bold text-white truncate">{selectedPfz.sector}</p>
            </div>
          </div>

          {/* Target Species */}
          <div className="space-y-1.5 text-xs">
            <span className="font-bold text-slate-300">Target Pelagic Species:</span>
            <div className="flex flex-wrap gap-1.5">
              {selectedPfz.targetSpecies.map((s) => (
                <span key={s} className="px-2 py-0.5 bg-marine-950 border border-cyan-800/80 rounded text-cyan-300 font-semibold">
                  {s}
                </span>
              ))}
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">{selectedPfz.description}</p>

          <div className="space-y-2 pt-2 border-t border-marine-750">
            <button
              onClick={() => {
                openChat();
                sendMessage(`Explain navigation bearing, depth profile, and species forecast for ${selectedPfz.name}`);
              }}
              className="w-full py-2 bg-marine-800 hover:bg-marine-750 text-cyan-300 font-bold text-xs rounded-xl border border-cyan-800 transition flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Ask AI Assistant About This Zone
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
