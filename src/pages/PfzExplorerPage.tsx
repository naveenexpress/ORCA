import React from 'react';
import {
  Fish,
  Search,
  Bookmark,
  Navigation,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { usePfzStore } from '../store/pfzStore';
import { SEED_LANDING_CENTRES } from '../data/seedData';
import { SafetyDisclaimer } from '../components/common/SafetyDisclaimer';
import { CompassBearing } from '../components/common/CompassBearing';
import { ConfidenceLevel } from '../types';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const PfzExplorerPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    advisories,
    searchQuery,
    setSearchQuery,
    selectedLandingCentre,
    setSelectedLandingCentre,
    selectedConfidence,
    setSelectedConfidence,
    showExpired,
    setShowExpired,
    bookmarkedIds,
    toggleBookmark,
    isLoading,
    error,
  } = usePfzStore();

  const filteredAdvisories = advisories.filter((a) => {
    // 1. Expired Filter
    if (!showExpired && (a.status === 'expired' || a.status === 'withdrawn')) return false;

    // 2. Landing Centre Filter
    if (selectedLandingCentre !== 'ALL' && a.landingCentreId !== selectedLandingCentre) return false;

    // 3. Confidence Filter
    if (selectedConfidence !== 'ALL' && a.confidence !== selectedConfidence) return false;

    // 4. Search Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = a.name.toLowerCase().includes(q);
      const matchSpecies = a.targetSpecies.some((s) => s.toLowerCase().includes(q));
      const matchSector = a.sector.toLowerCase().includes(q);
      const matchState = a.state.toLowerCase().includes(q);
      if (!matchName && !matchSpecies && !matchSector && !matchState) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-marine-900 via-marine-850 to-cyan-950/40 p-5 rounded-2xl border border-marine-750 shadow-hud">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-cyan-950 text-cyan-300 border border-cyan-800 rounded font-mono text-xs font-bold flex items-center gap-1.5">
              <Fish className="w-3.5 h-3.5 text-cyan-400" />
              SATELLITE DERIVED PFZ ADVISORIES
            </span>
            <span className="text-xs text-slate-400 font-mono">Oceansat-3 / MODIS Feed</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            {t('pfz.title', 'Potential Fishing Zones')}
          </h1>
          <p className="text-xs text-slate-300">
            {t('pfz.subtitle', 'Satellite-derived oceanic front and chlorophyll concentration advisories')}
          </p>
        </div>
      </div>

      <SafetyDisclaimer />

      {/* Non-fatal error banner */}
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 bg-red-950/40 border border-red-800/60 rounded-xl text-red-300 text-xs font-mono">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="marine-card rounded-2xl p-4 border border-marine-750 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('pfz.searchPlaceholder', 'Search by harbour, region, or species...')}
              className="w-full bg-marine-950 border border-marine-750 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Landing Centre Filter */}
          <select
            value={selectedLandingCentre}
            onChange={(e) => setSelectedLandingCentre(e.target.value)}
            className="w-full bg-marine-950 border border-marine-750 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">{t('pfz.filterByHarbour', 'All Landing Centres & Harbours')}</option>
            {SEED_LANDING_CENTRES.map((lc) => (
              <option key={lc.id} value={lc.id}>
                {lc.name} ({lc.state})
              </option>
            ))}
          </select>

          {/* Confidence Filter */}
          <select
            value={selectedConfidence}
            onChange={(e) => setSelectedConfidence(e.target.value as ConfidenceLevel | 'ALL')}
            className="w-full bg-marine-950 border border-marine-750 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">{t('pfz.confidence', 'All Confidence Levels')}</option>
            <option value="High">High Confidence (Thermal + Chlorophyll)</option>
            <option value="Moderate">Moderate Confidence</option>
            <option value="Low">Low Confidence</option>
          </select>

          {/* Show Expired Toggle */}
          <label className="flex items-center gap-2 p-2 bg-marine-950 border border-marine-750 rounded-xl cursor-pointer text-xs text-slate-300">
            <input
              type="checkbox"
              checked={showExpired}
              onChange={(e) => setShowExpired(e.target.checked)}
              className="accent-cyan-500 rounded"
            />
            <span>{t('pfz.showExpired', 'Include Expired Records')}</span>
          </label>
        </div>
      </div>

      {/* Loading spinner — shown only when empty during initial fetch */}
      {isLoading && advisories.length === 0 && (
        <div className="flex items-center justify-center gap-2 py-16 text-cyan-400 text-xs font-mono">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Loading PFZ advisories from database…</span>
        </div>
      )}

      {/* Advisories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAdvisories.map((advisory) => {
          const isBookmarked = bookmarkedIds.includes(advisory.id);
          const isExpired = advisory.status === 'expired' || advisory.status === 'withdrawn';

          return (
            <div
              key={advisory.id}
              className={`marine-card rounded-2xl p-5 border transition flex flex-col justify-between space-y-4 ${
                isExpired ? 'opacity-60 border-slate-700 bg-slate-900/40' : 'marine-card-hover border-marine-750'
              }`}
            >
              <div className="space-y-3">
                {/* Card Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold uppercase ${
                          advisory.confidence === 'High'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                        }`}
                      >
                        {advisory.confidence} CONFIDENCE
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {advisory.state}
                      </span>
                    </div>
                    <h3 className="font-bold text-white text-base mt-1.5 leading-snug">{advisory.name}</h3>
                  </div>

                  <button
                    onClick={() => toggleBookmark(advisory.id)}
                    className="p-1.5 text-slate-400 hover:text-cyan-400 rounded-lg hover:bg-marine-800 transition"
                  >
                    <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-cyan-400 text-cyan-400' : ''}`} />
                  </button>
                </div>

                {/* Compass & Bearing */}
                <CompassBearing
                  bearingDegrees={advisory.bearingDegrees}
                  directionText={advisory.directionFromLandingCentre}
                  distanceKm={advisory.distanceKm}
                  distanceNM={advisory.distanceFromLandingCentre}
                  landingCentreName={advisory.landingCentreName}
                  size="sm"
                />

                {/* Marine Parameters */}
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2 bg-marine-950 rounded-lg">
                    <span className="text-[10px] text-slate-400">Depth</span>
                    <p className="font-bold text-white">{advisory.depth} m ({advisory.depthFathoms} fm)</p>
                  </div>
                  <div className="p-2 bg-marine-950 rounded-lg">
                    <span className="text-[10px] text-slate-400">SST</span>
                    <p className="font-bold text-amber-400">{advisory.seaSurfaceTemperature} °C</p>
                  </div>
                </div>

                {/* Target Species */}
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-300">Target Species:</span>
                  <div className="flex flex-wrap gap-1">
                    {advisory.targetSpecies.map((s) => (
                      <span
                        key={s}
                        className="px-2 py-0.5 bg-marine-950 border border-cyan-800/60 rounded text-[11px] text-cyan-300"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">{advisory.description}</p>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-3 border-t border-marine-750 flex items-center justify-between gap-2">
                <button
                  onClick={() => navigate(`/map?focus=${advisory.id}`)}
                  className="px-3 py-1.5 bg-marine-800 hover:bg-marine-750 text-cyan-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Map</span>
                </button>

                <button
                  onClick={() => navigate(`/pfz/${advisory.id}`)}
                  className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-black font-extrabold rounded-xl text-xs shadow-glow-cyan transition"
                >
                  Full Advisory Details →
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
