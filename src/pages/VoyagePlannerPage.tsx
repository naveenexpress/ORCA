import React, { useState, useMemo, useEffect } from 'react';
import {
  Compass,
  Navigation,
  Fuel,
  Anchor,
  Clock,
  Calendar,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Download,
  Share2,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  Layers,
  Droplets,
  Package,
  ShieldCheck,
  ChevronRight,
  Fish,
  Users,
  Ship,
  Info,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { usePfzStore } from '../store/pfzStore';
import { useAuthStore } from '../store/authStore';
import { SEED_LANDING_CENTRES } from '../data/seedData';
import { Coordinates } from '../types';
import {
  VESSEL_PRESETS,
  COMMON_SPECIES_PRICES,
  calculateVoyagePlan,
  VesselType,
} from '../services/voyageService';
import { VoyageMap } from '../components/voyage/VoyageMap';

export const VoyagePlannerPage: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { advisories } = usePfzStore();
  const { currentUser } = useAuthStore();

  const publishedAdvisories = advisories.filter((a) => a.status === 'published');
  const targetIdFromUrl = searchParams.get('target');
  const initialAdvisory =
    advisories.find((a) => a.id === targetIdFromUrl) || publishedAdvisories[0] || advisories[0];

  // Selected State
  const [selectedHarbour, setSelectedHarbour] = useState(SEED_LANDING_CENTRES[0]);
  const [selectedPfzId, setSelectedPfzId] = useState<string>(initialAdvisory?.id || '');
  const [customDestinationCoords, setCustomDestinationCoords] = useState<Coordinates | null>(null);

  const selectedPfz = useMemo(() => {
    return advisories.find((a) => a.id === selectedPfzId) || initialAdvisory;
  }, [advisories, selectedPfzId, initialAdvisory]);

  // Destination object (either selected PFZ or custom clicked coordinate)
  const destination = useMemo(() => {
    if (customDestinationCoords) {
      return {
        name: `Custom Waypoint (${customDestinationCoords.lat}°N, ${customDestinationCoords.lng}°E)`,
        coordinates: customDestinationCoords,
      };
    }
    return {
      name: selectedPfz ? selectedPfz.name : 'Target Fishing Ground',
      coordinates: selectedPfz
        ? { lat: selectedPfz.latitude, lng: selectedPfz.longitude }
        : { lat: 13.35, lng: 80.65 },
    };
  }, [customDestinationCoords, selectedPfz]);

  // Operational Inputs
  const [selectedVessel, setSelectedVessel] = useState<VesselType>(VESSEL_PRESETS[0]);
  const [fishingDurationHours, setFishingDurationHours] = useState<number>(12);
  const [crewCount, setCrewCount] = useState<number>(selectedVessel.typicalCrewSize);
  const [fuelPricePerLiter, setFuelPricePerLiter] = useState<number>(selectedVessel.defaultFuelPricePerLiter);
  const [seaStateFactor, setSeaStateFactor] = useState<number>(1.05); // 1.0 = Calm, 1.15 = Moderate, 1.3 = Swell
  const [targetSpecies, setTargetSpecies] = useState<string>(
    selectedPfz?.targetSpecies[0] || 'Yellowfin Tuna'
  );

  // Update crew and fuel price when vessel changes
  useEffect(() => {
    setCrewCount(selectedVessel.typicalCrewSize);
    setFuelPricePerLiter(selectedVessel.defaultFuelPricePerLiter);
  }, [selectedVessel]);

  // Update target species when selected PFZ changes
  useEffect(() => {
    if (selectedPfz?.targetSpecies?.length) {
      setTargetSpecies(selectedPfz.targetSpecies[0]);
    }
  }, [selectedPfz]);

  // Notification Toast
  const [alertNotice, setAlertNotice] = useState<string | null>(null);

  // Calculate Voyage Metrics
  const calculation = useMemo(() => {
    return calculateVoyagePlan({
      vessel: selectedVessel,
      departureCoords: selectedHarbour.coordinates,
      targetCoords: destination.coordinates,
      fishingDurationHours,
      crewCount,
      fuelPricePerLiter,
      seaStateFactor,
      primaryTargetSpecies: targetSpecies,
    });
  }, [
    selectedVessel,
    selectedHarbour,
    destination,
    fishingDurationHours,
    crewCount,
    fuelPricePerLiter,
    seaStateFactor,
    targetSpecies,
  ]);

  // Map Click Handler to set destination
  const handleDestinationSelect = (coords: Coordinates) => {
    setCustomDestinationCoords(coords);
    setAlertNotice(`Destination updated to coordinates [${coords.lat}°N, ${coords.lng}°E]`);
    setTimeout(() => setAlertNotice(null), 3500);
  };

  // Reset to original PFZ
  const handleResetToPfz = () => {
    setCustomDestinationCoords(null);
    setAlertNotice('Reset to official PFZ advisory destination.');
    setTimeout(() => setAlertNotice(null), 3000);
  };

  // Export Manifest & GPS Coordinates
  const handleExportManifest = () => {
    const manifest = [
      `========================================================================`,
      `ORCA MARITIME VOYAGE MANIFEST & RESOURCE DISPATCH PLAN`,
      `========================================================================`,
      `Date & Time        : ${new Date().toLocaleString()}`,
      `Vessel Craft       : ${selectedVessel.name} (${selectedVessel.lengthMeters}m, ${selectedVessel.engineBhp} BHP)`,
      `Registered Skipper : ${currentUser?.name || 'Murugan Selvam'}`,
      `Departure Port     : ${selectedHarbour.name} (${selectedHarbour.coordinates.lat}°N, ${selectedHarbour.coordinates.lng}°E)`,
      `Destination Zone   : ${destination.name} (${destination.coordinates.lat}°N, ${destination.coordinates.lng}°E)`,
      `Primary Target     : ${targetSpecies}`,
      ``,
      `--- NAVIGATION TELEMETRY ---`,
      `Compass Bearing    : ${calculation.bearingDegrees}° (${calculation.compassDirection})`,
      `One-Way Distance   : ${calculation.oneWayDistanceNm} Nautical Miles (${calculation.oneWayDistanceKm} km)`,
      `Round-Trip Distance: ${calculation.roundTripDistanceNm} Nautical Miles (${calculation.roundTripDistanceKm} km)`,
      `Cruising Speed     : ${selectedVessel.cruiseSpeedKnots} knots`,
      `Transit Time       : ${calculation.transitTimeOneWayHours} hrs (one-way) / ${calculation.transitTimeTotalHours} hrs (round-trip)`,
      `Fishing Duration   : ${calculation.fishingDurationHours} hours on station`,
      `Total Voyage Time  : ${calculation.totalVoyageHours} hours (~${calculation.totalDays} days)`,
      ``,
      `--- RESOURCE & PROVISIONING REQUIREMENTS ---`,
      `Transit Fuel       : ${calculation.transitFuelLiters} L`,
      `On-Station Burn    : ${calculation.fishingFuelLiters} L`,
      `Safety Reserve(20%): ${calculation.reserveFuelLiters} L`,
      `Total Fuel Needed  : ${calculation.totalFuelLiters} Liters (@ ₹${fuelPricePerLiter}/L = ₹${calculation.fuelCostTotalRupees.toLocaleString()})`,
      `Preservation Ice   : ${calculation.iceRequiredKg} kg (${calculation.iceRequiredTons} Tons = ₹${calculation.iceCostTotalRupees.toLocaleString()})`,
      `Fresh Water        : ${calculation.drinkingWaterLiters} Liters for ${crewCount} crew members`,
      `Provisions & Food  : ₹${calculation.provisionsCostRupees.toLocaleString()}`,
      `Port Clearance Levy: ₹${calculation.portLevyCostRupees.toLocaleString()}`,
      `TOTAL TRIP COST    : ₹${calculation.totalOperatingCostRupees.toLocaleString()}`,
      ``,
      `--- FINANCIAL & CATCH YIELD ESTIMATION ---`,
      `Target Biomass Est : ${calculation.expectedCatchKg} kg`,
      `Avg Market Rate    : ₹${COMMON_SPECIES_PRICES[targetSpecies] || 220} / kg`,
      `Gross Revenue Est  : ₹${calculation.expectedGrossRevenueRupees.toLocaleString()}`,
      `Projected Net Gain : ₹${calculation.projectedNetProfitRupees.toLocaleString()}`,
      `Break-even Catch   : ${calculation.breakEvenCatchKg} kg`,
      `Estimated ROI      : ${calculation.roiPercentage}%`,
      ``,
      `========================================================================`,
      `EMERGENCY SAR: Indian Coast Guard Maritime Hotline: 1554 / VHF CH-16`,
      `========================================================================`,
    ].join('\n');

    const blob = new Blob([manifest], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ORCA_Voyage_Plan_${selectedHarbour.name.split(' ')[0]}_${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);

    setAlertNotice('Voyage Manifest exported successfully!');
    setTimeout(() => setAlertNotice(null), 3500);
  };

  // Simulating filing clearance with harbour master
  const handleFileClearance = () => {
    setAlertNotice(
      `Voyage plan filed with ${selectedHarbour.name} Harbour Dispatch Desk. Clearance Reference: ORCA-CLR-${Math.floor(
        100000 + Math.random() * 900000
      )}`
    );
    setTimeout(() => setAlertNotice(null), 5000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div
        className="relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl border border-[#563943] shadow-xl"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(20, 12, 20, 0.94) 0%, rgba(26, 17, 24, 0.88) 45%, rgba(36, 24, 30, 0.55) 80%, rgba(20, 12, 20, 0.2) 100%), url('/sunset-boat.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center right',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="space-y-1.5 relative z-10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-[#C05615]/20 text-[#F59E0B] border border-[#C05615]/40 rounded font-mono text-xs font-bold flex items-center gap-1.5 shadow-sm">
              <Compass className="w-3.5 h-3.5 animate-spin text-[#F59E0B]" />
              VOYAGE DISPATCH & RESOURCE LOGISTICS
            </span>
            <span className="text-xs text-[#D4C2B6] font-mono">Precision Marine Navigation</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#FFF6EE] tracking-tight drop-shadow-md">
            Smart Voyage Planner & Resource Estimator
          </h1>
          <p className="text-xs text-[#D4C2B6] max-w-xl leading-relaxed">
            Real-time nautical routing, fuel consumption forecasting, ice preservation requirements, and catch profitability modeling.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 relative z-10">
          <button
            onClick={handleExportManifest}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#D95202] to-[#B8470B] hover:from-[#EA580C] hover:to-[#C2410C] text-white font-extrabold text-xs rounded-xl shadow-md border border-[#E66F23] transition"
          >
            <Download className="w-4 h-4" />
            <span>Export Manifest</span>
          </button>

          <button
            onClick={handleFileClearance}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#0C5240] to-[#047857] hover:from-[#047857] hover:to-[#065F46] text-white font-extrabold text-xs rounded-xl shadow-md border border-[#10B981]/30 transition"
          >
            <ShieldCheck className="w-4 h-4 text-[#10B981]" />
            <span>File Harbour Clearance</span>
          </button>
        </div>
      </div>

      {/* Floating Notification Toast */}
      {alertNotice && (
        <div className="p-3.5 bg-[#EAF8F1] border border-[#BFE7D1] text-[#16845F] rounded-xl flex items-center gap-2 text-xs font-semibold shadow-sm animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-[#24A978] shrink-0" />
          <span>{alertNotice}</span>
        </div>
      )}

      {/* Main Grid: Parameters on Left, Map on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Voyage Configuration Form (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-[#D7E7F0] shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-[#123B6D] flex items-center gap-2 border-b border-[#D7E7F0] pb-3">
              <Ship className="w-4 h-4 text-[#1769AA]" />
              <span>Voyage Parameters & Craft Setup</span>
            </h3>

            {/* Departure Harbour */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#123B6D] flex items-center justify-between">
                <span>1. Departure Harbour</span>
                <span className="text-[10px] text-[#55718D] font-mono">Origin Port</span>
              </label>
              <select
                value={selectedHarbour.id}
                onChange={(e) => {
                  const h = SEED_LANDING_CENTRES.find((lc) => lc.id === e.target.value);
                  if (h) setSelectedHarbour(h);
                }}
                className="w-full px-3 py-2 bg-[#F4FAFD] border border-[#D7E7F0] rounded-xl text-xs text-[#123B6D] font-semibold focus:outline-hidden focus:border-[#1769AA]"
              >
                {SEED_LANDING_CENTRES.map((lc) => (
                  <option key={lc.id} value={lc.id}>
                    {lc.name} ({lc.state} - {lc.harbourType})
                  </option>
                ))}
              </select>
            </div>

            {/* Target Destination / PFZ */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#123B6D]">2. Target Fishing Zone (PFZ)</label>
                {customDestinationCoords && (
                  <button
                    onClick={handleResetToPfz}
                    className="text-[10px] text-[#1769AA] font-bold hover:underline flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset to PFZ
                  </button>
                )}
              </div>
              <select
                value={customDestinationCoords ? 'custom' : selectedPfzId}
                onChange={(e) => {
                  if (e.target.value === 'custom') return;
                  setCustomDestinationCoords(null);
                  setSelectedPfzId(e.target.value);
                }}
                className="w-full px-3 py-2 bg-[#F4FAFD] border border-[#D7E7F0] rounded-xl text-xs text-[#123B6D] font-semibold focus:outline-hidden focus:border-[#1769AA]"
              >
                {customDestinationCoords && (
                  <option value="custom">📍 Custom Waypoint ({customDestinationCoords.lat}°N, {customDestinationCoords.lng}°E)</option>
                )}
                {advisories.map((adv) => (
                  <option key={adv.id} value={adv.id}>
                    [{adv.confidence}] {adv.name} · {adv.distanceKm} km · {adv.targetSpecies.slice(0, 2).join(', ')}
                  </option>
                ))}
              </select>
            </div>

            {/* Vessel Craft Preset Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#123B6D]">3. Fishing Vessel Craft Class</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {VESSEL_PRESETS.map((v) => {
                  const isSelected = selectedVessel.id === v.id;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVessel(v)}
                      className={`p-3 rounded-xl text-left border transition ${
                        isSelected
                          ? 'bg-[#E8F8FB] border-[#168DCC] shadow-xs'
                          : 'bg-[#F4FAFD] border-[#D7E7F0] hover:bg-[#EDF6FA]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-mono font-bold text-[#1769AA]">
                          {v.category.replace('_', ' ')}
                        </span>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#168DCC]" />}
                      </div>
                      <p className="text-xs font-bold text-[#123B6D] line-clamp-1 mt-0.5">{v.name}</p>
                      <p className="text-[10px] text-[#55718D] font-mono mt-1">
                        {v.engineBhp} BHP · {v.consumptionLitersPerHour} L/hr · {v.cruiseSpeedKnots} kt
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mission Operational Controls */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-bold text-[#123B6D] mb-1">
                  Fishing Hours on Zone
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min={1}
                    max={120}
                    value={fishingDurationHours}
                    onChange={(e) => setFishingDurationHours(Math.max(1, +e.target.value))}
                    className="w-full px-3 py-1.5 bg-[#F4FAFD] border border-[#D7E7F0] rounded-xl text-xs font-mono font-bold text-[#123B6D]"
                  />
                  <span className="text-xs text-[#55718D] font-medium">hrs</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#123B6D] mb-1">
                  Active Crew Size
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min={1}
                    max={25}
                    value={crewCount}
                    onChange={(e) => setCrewCount(Math.max(1, +e.target.value))}
                    className="w-full px-3 py-1.5 bg-[#F4FAFD] border border-[#D7E7F0] rounded-xl text-xs font-mono font-bold text-[#123B6D]"
                  />
                  <span className="text-xs text-[#55718D] font-medium">crew</span>
                </div>
              </div>
            </div>

            {/* Sea State Factor & Fuel Price */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-[#123B6D] mb-1">
                  Sea Resistance
                </label>
                <select
                  value={seaStateFactor}
                  onChange={(e) => setSeaStateFactor(+e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#F4FAFD] border border-[#D7E7F0] rounded-xl text-xs text-[#123B6D]"
                >
                  <option value={1.0}>Calm (Swell &lt;1.0m)</option>
                  <option value={1.08}>Moderate (1.0 - 1.8m)</option>
                  <option value={1.22}>Rough (Swell &gt;2.0m)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#123B6D] mb-1">
                  Fuel Price (₹/L)
                </label>
                <input
                  type="number"
                  step={0.5}
                  value={fuelPricePerLiter}
                  onChange={(e) => setFuelPricePerLiter(+e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#F4FAFD] border border-[#D7E7F0] rounded-xl text-xs font-mono text-[#123B6D]"
                />
              </div>
            </div>

            {/* Target Species for Value Estimation */}
            <div className="space-y-1 pt-1">
              <label className="text-[11px] font-bold text-[#123B6D] flex items-center justify-between">
                <span>Primary Target Species (Mandi Value)</span>
                <span className="text-[10px] text-[#10B981] font-mono">
                  ₹{COMMON_SPECIES_PRICES[targetSpecies] || 220}/kg
                </span>
              </label>
              <select
                value={targetSpecies}
                onChange={(e) => setTargetSpecies(e.target.value)}
                className="w-full px-3 py-1.5 bg-[#F4FAFD] border border-[#D7E7F0] rounded-xl text-xs text-[#123B6D]"
              >
                {Object.keys(COMMON_SPECIES_PRICES).map((sp) => (
                  <option key={sp} value={sp}>
                    {sp} (Wholesale avg ₹{COMMON_SPECIES_PRICES[sp]}/kg)
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Right Col: Interactive Course Map & Telemetry (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Cross-Peninsular Advisory Alert */}
          {calculation.seaRoute.isCrossPeninsular && (
            <div className="p-3.5 bg-[#FFF7E3] border border-[#F0D98C] rounded-2xl text-xs text-[#123B6D] space-y-1.5 shadow-xs animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-[#D97706]">
                  <AlertTriangle className="w-4 h-4 text-[#E7A928] shrink-0" />
                  <span>Cape Comorin Sea Route Active ({calculation.seaRoute.totalDistanceNm} NM)</span>
                </div>
                <span className="px-2 py-0.5 bg-[#F0D98C]/60 text-[#B8790E] rounded font-mono text-[10px] font-bold">
                  CROSS-COAST VOYAGE
                </span>
              </div>
              <p className="text-[11px] text-[#55718D] leading-relaxed">
                Departure harbour <strong>{selectedHarbour.name}</strong> and target ground <strong>{destination.name}</strong> are on opposite coasts. Vessel is safely navigating the nautical channel around Cape Comorin.
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[#F0D98C]/60">
                <span className="text-[11px] font-semibold text-[#123B6D]">💡 Want to depart from the same coast?</span>
                <button
                  type="button"
                  onClick={() => {
                    const best = SEED_LANDING_CENTRES.reduce((closest, lc) => {
                      const d1 = Math.hypot(lc.coordinates.lat - destination.coordinates.lat, lc.coordinates.lng - destination.coordinates.lng);
                      const d2 = Math.hypot(closest.coordinates.lat - destination.coordinates.lat, closest.coordinates.lng - destination.coordinates.lng);
                      return d1 < d2 ? lc : closest;
                    }, SEED_LANDING_CENTRES[0]);
                    setSelectedHarbour(best);
                    setAlertNotice(`Switched departure harbour to ${best.name} (${best.state}).`);
                    setTimeout(() => setAlertNotice(null), 4000);
                  }}
                  className="px-2.5 py-1 bg-[#1769AA] hover:bg-[#123B6D] text-white font-extrabold text-[10px] rounded-lg shadow-xs transition"
                >
                  Switch to Nearest Coastal Harbour
                </button>
              </div>
            </div>
          )}

          <VoyageMap
            departure={{
              name: selectedHarbour.name,
              coordinates: selectedHarbour.coordinates,
            }}
            destination={{
              name: destination.name,
              coordinates: destination.coordinates,
            }}
            bearingDegrees={calculation.bearingDegrees}
            compassDirection={calculation.compassDirection}
            distanceNm={calculation.oneWayDistanceNm}
            distanceKm={calculation.oneWayDistanceKm}
            seaRoute={calculation.seaRoute}
            onDestinationSelect={handleDestinationSelect}
            height="460px"
          />

          {/* Quick Route Stats Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-3 rounded-xl border border-[#D7E7F0] shadow-xs">
              <span className="text-[10px] uppercase font-mono text-[#55718D]">Outbound Transit</span>
              <p className="text-base font-extrabold text-[#123B6D] font-mono mt-0.5">
                {calculation.transitTimeOneWayHours} hrs
              </p>
              <p className="text-[10px] text-[#7890A5]">@ {selectedVessel.cruiseSpeedKnots} knots speed</p>
            </div>

            <div className="bg-white p-3 rounded-xl border border-[#D7E7F0] shadow-xs">
              <span className="text-[10px] uppercase font-mono text-[#55718D]">Total Voyage</span>
              <p className="text-base font-extrabold text-[#1769AA] font-mono mt-0.5">
                {calculation.totalVoyageHours} hrs
              </p>
              <p className="text-[10px] text-[#7890A5]">~{calculation.totalDays} days round-trip</p>
            </div>

            <div className="bg-white p-3 rounded-xl border border-[#D7E7F0] shadow-xs">
              <span className="text-[10px] uppercase font-mono text-[#55718D]">Total Distance</span>
              <p className="text-base font-extrabold text-[#123B6D] font-mono mt-0.5">
                {calculation.roundTripDistanceNm} NM
              </p>
              <p className="text-[10px] text-[#7890A5]">({calculation.roundTripDistanceKm} km round-trip)</p>
            </div>

            <div className="bg-white p-3 rounded-xl border border-[#D7E7F0] shadow-xs">
              <span className="text-[10px] uppercase font-mono text-[#55718D]">Required Fuel</span>
              <p className="text-base font-extrabold text-[#EA580C] font-mono mt-0.5">
                {calculation.totalFuelLiters} L
              </p>
              <p className="text-[10px] text-[#16845F]">Incl. +20% reserve</p>
            </div>
          </div>
        </div>
      </div>

      {/* Resource & Economics Estimation Breakdown (4 Feature Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Fuel Logistics */}
        <div className="bg-white rounded-2xl p-4 border border-[#D7E7F0] shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-[#D7E7F0] pb-2">
            <div className="flex items-center gap-2 text-[#123B6D] font-bold text-xs">
              <Fuel className="w-4 h-4 text-[#EA580C]" />
              <span>Fuel Logistics & Burn</span>
            </div>
            <span className="px-2 py-0.5 bg-[#FFF7E3] text-[#E7A928] border border-[#F0D98C] rounded text-[10px] font-mono font-bold">
              {selectedVessel.fuelType === 'diesel' ? 'DIESEL' : 'PETROL/KEROSENE'}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between p-2 bg-[#F4FAFD] border border-[#D7E7F0] rounded-lg">
              <span className="text-[#55718D]">Transit Burn (Both Ways):</span>
              <span className="font-mono font-bold text-[#123B6D]">{calculation.transitFuelLiters} L</span>
            </div>
            <div className="flex justify-between p-2 bg-[#F4FAFD] border border-[#D7E7F0] rounded-lg">
              <span className="text-[#55718D]">Stationary / Fishing Burn:</span>
              <span className="font-mono font-bold text-[#123B6D]">{calculation.fishingFuelLiters} L</span>
            </div>
            <div className="flex justify-between p-2 bg-[#F4FAFD] border border-[#D7E7F0] rounded-lg">
              <span className="text-[#55718D]">Statutory Safety Reserve (20%):</span>
              <span className="font-mono font-bold text-[#16845F]">{calculation.reserveFuelLiters} L</span>
            </div>
            <div className="flex justify-between p-2 bg-[#FFF7E3] border border-[#F0D98C] rounded-lg font-bold text-[#123B6D]">
              <span>Total Fuel Budget:</span>
              <span className="font-mono text-[#EA580C]">₹{calculation.fuelCostTotalRupees.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Ice & Cold Chain Preservation */}
        <div className="bg-white rounded-2xl p-4 border border-[#D7E7F0] shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-[#D7E7F0] pb-2">
            <div className="flex items-center gap-2 text-[#123B6D] font-bold text-xs">
              <Package className="w-4 h-4 text-[#168DCC]" />
              <span>Ice & Cold Preservation</span>
            </div>
            <span className="px-2 py-0.5 bg-[#E8F8FB] text-[#1769AA] border border-[#CFE6EF] rounded text-[10px] font-mono font-bold">
              RATIO 1:1.25
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between p-2 bg-[#F4FAFD] border border-[#D7E7F0] rounded-lg">
              <span className="text-[#55718D]">Expected Catch Target:</span>
              <span className="font-mono font-bold text-[#123B6D]">{calculation.expectedCatchKg} kg</span>
            </div>
            <div className="flex justify-between p-2 bg-[#F4FAFD] border border-[#D7E7F0] rounded-lg">
              <span className="text-[#55718D]">Preservation Ice Needed:</span>
              <span className="font-mono font-bold text-[#1769AA]">{calculation.iceRequiredKg} kg</span>
            </div>
            <div className="flex justify-between p-2 bg-[#F4FAFD] border border-[#D7E7F0] rounded-lg">
              <span className="text-[#55718D]">Crushed Ice Tonnage:</span>
              <span className="font-mono font-bold text-[#123B6D]">{calculation.iceRequiredTons} Tons</span>
            </div>
            <div className="flex justify-between p-2 bg-[#E8F8FB] border border-[#CFE6EF] rounded-lg font-bold text-[#123B6D]">
              <span>Estimated Ice Cost:</span>
              <span className="font-mono text-[#1769AA]">₹{calculation.iceCostTotalRupees.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Card 3: Crew Provisions & Welfare */}
        <div className="bg-white rounded-2xl p-4 border border-[#D7E7F0] shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-[#D7E7F0] pb-2">
            <div className="flex items-center gap-2 text-[#123B6D] font-bold text-xs">
              <Users className="w-4 h-4 text-[#10B981]" />
              <span>Crew Provisions & Rations</span>
            </div>
            <span className="px-2 py-0.5 bg-[#EAF8F1] text-[#16845F] border border-[#BFE7D1] rounded text-[10px] font-mono font-bold">
              {crewCount} CREW
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between p-2 bg-[#F4FAFD] border border-[#D7E7F0] rounded-lg">
              <span className="text-[#55718D]">Drinking Water Reserve:</span>
              <span className="font-mono font-bold text-[#1769AA]">{calculation.drinkingWaterLiters} Liters</span>
            </div>
            <div className="flex justify-between p-2 bg-[#F4FAFD] border border-[#D7E7F0] rounded-lg">
              <span className="text-[#55718D]">Rations, Food & Tea:</span>
              <span className="font-mono font-bold text-[#123B6D]">₹{calculation.provisionsCostRupees.toLocaleString()}</span>
            </div>
            <div className="flex justify-between p-2 bg-[#F4FAFD] border border-[#D7E7F0] rounded-lg">
              <span className="text-[#55718D]">Harbour Clearance Fee:</span>
              <span className="font-mono font-bold text-[#123B6D]">₹{calculation.portLevyCostRupees}</span>
            </div>
            <div className="flex justify-between p-2 bg-[#EAF8F1] border border-[#BFE7D1] rounded-lg font-bold text-[#123B6D]">
              <span>Total Provisioning:</span>
              <span className="font-mono text-[#16845F]">
                ₹{(calculation.provisionsCostRupees + calculation.portLevyCostRupees).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: Voyage ROI & Financial Projection */}
        <div className="bg-white rounded-2xl p-4 border border-[#D7E7F0] shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-[#D7E7F0] pb-2">
            <div className="flex items-center gap-2 text-[#123B6D] font-bold text-xs">
              <TrendingUp className="w-4 h-4 text-[#10B981]" />
              <span>Projected ROI & Profit</span>
            </div>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                calculation.projectedNetProfitRupees > 0
                  ? 'bg-[#EAF8F1] text-[#16845F] border-[#BFE7D1]'
                  : 'bg-[#FEE2E2] text-[#DC2626] border-[#FCA5A5]'
              }`}
            >
              {calculation.roiPercentage > 0 ? `+${calculation.roiPercentage}% ROI` : 'LOSS RISK'}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between p-2 bg-[#F4FAFD] border border-[#D7E7F0] rounded-lg">
              <span className="text-[#55718D]">Total Voyage Cost:</span>
              <span className="font-mono font-bold text-[#E5484D]">
                ₹{calculation.totalOperatingCostRupees.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between p-2 bg-[#F4FAFD] border border-[#D7E7F0] rounded-lg">
              <span className="text-[#55718D]">Estimated Gross Catch:</span>
              <span className="font-mono font-bold text-[#123B6D]">
                ₹{calculation.expectedGrossRevenueRupees.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between p-2 bg-[#F4FAFD] border border-[#D7E7F0] rounded-lg">
              <span className="text-[#55718D]">Break-Even Catch Yield:</span>
              <span className="font-mono font-bold text-[#1769AA]">{calculation.breakEvenCatchKg} kg</span>
            </div>
            <div
              className={`flex justify-between p-2 rounded-lg font-bold border ${
                calculation.projectedNetProfitRupees > 0
                  ? 'bg-[#EAF8F1] border-[#BFE7D1] text-[#16845F]'
                  : 'bg-[#FEE2E2] border-[#FCA5A5] text-[#DC2626]'
              }`}
            >
              <span>Net Projected Profit:</span>
              <span className="font-mono text-sm">₹{calculation.projectedNetProfitRupees.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Safety & Departure Clearance Strip */}
      <div className="bg-[#FFFDF5] border border-[#F0D98C] rounded-2xl p-4 text-xs text-[#123B6D] flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-start gap-2.5">
          <ShieldCheck className="w-5 h-5 text-[#E7A928] shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm text-[#123B6D]">Maritime Safety Advisory & Radio Watch</h4>
            <p className="text-[11px] text-[#55718D] mt-0.5">
              Maintain continuous VHF listening watch on Channel 16. In the event of engine failure or distress, transmit SOS or contact Indian Coast Guard SAR at <strong>1554</strong>.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
          <button
            onClick={() => navigate('/map')}
            className="px-3.5 py-2 bg-white hover:bg-[#F4FAFD] border border-[#D7E7F0] font-bold text-xs rounded-xl text-[#1769AA] transition"
          >
            View Live Marine Map
          </button>
          <button
            onClick={() => navigate('/pfz')}
            className="px-3.5 py-2 bg-[#1769AA] hover:bg-[#123B6D] font-bold text-xs rounded-xl text-white transition"
          >
            Browse All PFZ Zones
          </button>
        </div>
      </div>
    </div>
  );
};
