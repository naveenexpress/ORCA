import { Coordinates, PfzAdvisory, LandingCentre } from '../types';

export interface VesselType {
  id: string;
  name: string;
  nameLocal?: string;
  category: 'traditional' | 'motorized' | 'mechanized' | 'deep_sea';
  lengthMeters: number;
  engineBhp: number;
  fuelType: 'diesel' | 'petrol_kerosene';
  cruiseSpeedKnots: number; // typical cruising speed
  maxSpeedKnots: number;
  consumptionLitersPerHour: number; // at cruise speed
  fishHoldCapacityKg: number;
  typicalCrewSize: number;
  defaultFuelPricePerLiter: number;
}

export const VESSEL_PRESETS: VesselType[] = [
  {
    id: 'mech-trawler-38',
    name: '38ft Mechanized Wooden Trawler',
    nameLocal: 'விசைப்படகு (38 அடி)',
    category: 'mechanized',
    lengthMeters: 11.5,
    engineBhp: 95,
    fuelType: 'diesel',
    cruiseSpeedKnots: 8.5,
    maxSpeedKnots: 10.5,
    consumptionLitersPerHour: 16.5,
    fishHoldCapacityKg: 4500,
    typicalCrewSize: 6,
    defaultFuelPricePerLiter: 94.5,
  },
  {
    id: 'frp-motorized-28',
    name: '28ft FRP Motorized Beach Landing Craft',
    nameLocal: 'ஃபைபர் படகு (28 அடி OBM)',
    category: 'motorized',
    lengthMeters: 8.5,
    engineBhp: 25,
    fuelType: 'petrol_kerosene',
    cruiseSpeedKnots: 10.0,
    maxSpeedKnots: 13.0,
    consumptionLitersPerHour: 7.2,
    fishHoldCapacityKg: 1200,
    typicalCrewSize: 3,
    defaultFuelPricePerLiter: 101.5,
  },
  {
    id: 'deep-sea-longliner-55',
    name: '55ft Deep-Sea Multiday Steel Longliner',
    nameLocal: 'ஆழ்கடல் தூண்டில் படகு (55 அடி)',
    category: 'deep_sea',
    lengthMeters: 16.8,
    engineBhp: 180,
    fuelType: 'diesel',
    cruiseSpeedKnots: 9.5,
    maxSpeedKnots: 11.8,
    consumptionLitersPerHour: 26.0,
    fishHoldCapacityKg: 14000,
    typicalCrewSize: 10,
    defaultFuelPricePerLiter: 94.5,
  },
  {
    id: 'country-craft-obm',
    name: 'Traditional Catamaran / Country Craft with OBM',
    nameLocal: 'நாட்டுப் படகு (10 HP OBM)',
    category: 'traditional',
    lengthMeters: 6.5,
    engineBhp: 10,
    fuelType: 'petrol_kerosene',
    cruiseSpeedKnots: 6.5,
    maxSpeedKnots: 8.0,
    consumptionLitersPerHour: 3.8,
    fishHoldCapacityKg: 600,
    typicalCrewSize: 2,
    defaultFuelPricePerLiter: 101.5,
  },
];

export interface SpeciesMarketPrice {
  name: string;
  avgPricePerKg: number;
}

export const COMMON_SPECIES_PRICES: Record<string, number> = {
  'Yellowfin Tuna': 260,
  'Skipjack Tuna': 180,
  'Indian Mackerel': 160,
  'Seer Fish': 480,
  'Spanish Mackerel': 420,
  'Sardines': 90,
  'Oil Sardine': 85,
  'Squid': 280,
  'Cuttlefish': 310,
  'Ribbon Fish': 140,
  'Tiger Prawn': 520,
  'Snapper': 340,
  'Barracuda': 210,
  'Anchovy': 110,
};

export interface VoyageCalculationResult {
  oneWayDistanceKm: number;
  oneWayDistanceNm: number;
  roundTripDistanceKm: number;
  roundTripDistanceNm: number;
  bearingDegrees: number;
  compassDirection: string;
  transitTimeOneWayHours: number;
  transitTimeTotalHours: number;
  fishingDurationHours: number;
  totalVoyageHours: number;
  totalDays: number;
  // Fuel breakdown
  transitFuelLiters: number;
  fishingFuelLiters: number;
  reserveFuelLiters: number; // 20% safety margin
  totalFuelLiters: number;
  fuelCostTotalRupees: number;
  // Ice & storage
  iceRequiredKg: number;
  iceRequiredTons: number;
  iceCostTotalRupees: number;
  // Provisions
  drinkingWaterLiters: number;
  provisionsCostRupees: number;
  portLevyCostRupees: number;
  // Economics
  totalOperatingCostRupees: number;
  expectedCatchKg: number;
  expectedGrossRevenueRupees: number;
  projectedNetProfitRupees: number;
  breakEvenCatchKg: number;
  roiPercentage: number;
}

export function haversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return +(R * c).toFixed(2);
}

export function calculateBearingDegrees(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const y = Math.sin(dLon) * Math.cos((lat2 * Math.PI) / 180);
  const x =
    Math.cos((lat1 * Math.PI) / 180) * Math.sin((lat2 * Math.PI) / 180) -
    Math.sin((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.cos(dLon);
  const brng = ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
  return Math.round(brng);
}

export function bearingToCompass(deg: number): string {
  const val = Math.floor(deg / 22.5 + 0.5);
  const arr = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  return arr[val % 16];
}

export interface SeaWaypoint {
  id: string;
  name: string;
  coords: Coordinates;
  isDeparture?: boolean;
  isDestination?: boolean;
}

export interface MaritimeRouteResult {
  waypoints: Coordinates[];
  waypointMarkers: SeaWaypoint[];
  isCrossPeninsular: boolean;
  isCoastalTransit: boolean;
  totalDistanceKm: number;
  totalDistanceNm: number;
  bearingDegrees: number;
  compassDirection: string;
  routeTitle: string;
  passagesDescription: string;
}

// Navigable offshore corridor nodes (situated safely in open ocean water 8-15 NM off the coast)
const WEST_COAST_CORRIDOR: SeaWaypoint[] = [
  { id: 'wp-wc-okha', name: 'Off Okha', coords: { lat: 22.35, lng: 68.85 } },
  { id: 'wp-wc-veraval', name: 'Off Veraval Shelf', coords: { lat: 20.75, lng: 70.30 } },
  { id: 'wp-wc-mumbai', name: 'Off Mumbai Approaches', coords: { lat: 18.90, lng: 72.40 } },
  { id: 'wp-wc-ratnagiri', name: 'Off Ratnagiri', coords: { lat: 16.95, lng: 73.00 } },
  { id: 'wp-wc-goa', name: 'Off Mormugao (Goa)', coords: { lat: 15.35, lng: 73.55 } },
  { id: 'wp-wc-karwar', name: 'Off Karwar', coords: { lat: 14.75, lng: 73.85 } },
  { id: 'wp-wc-mangalore', name: 'Off Mangalore Fairway', coords: { lat: 12.85, lng: 74.50 } },
  { id: 'wp-wc-calicut', name: 'Off Kozhikode (Malabar)', coords: { lat: 11.20, lng: 75.40 } },
  { id: 'wp-wc-cochin', name: 'Off Cochin Fairway Buoy', coords: { lat: 9.93, lng: 75.80 } },
  { id: 'wp-wc-kollam', name: 'Off Kollam Coast', coords: { lat: 8.85, lng: 76.30 } },
  { id: 'wp-wc-vizhinjam', name: 'Off Vizhinjam Fairway', coords: { lat: 8.30, lng: 76.75 } },
];

const CAPE_COMORIN_PASSAGE: SeaWaypoint[] = [
  { id: 'wp-cape-west', name: 'Cape Comorin West Approach', coords: { lat: 7.70, lng: 77.20 } },
  { id: 'wp-cape-south', name: 'Cape Comorin South TSS Channel', coords: { lat: 7.45, lng: 77.60 } },
  { id: 'wp-cape-east', name: 'Gulf of Mannar South Entrance', coords: { lat: 7.65, lng: 78.10 } },
];

const EAST_COAST_CORRIDOR: SeaWaypoint[] = [
  { id: 'wp-ec-tuticorin', name: 'Off Tuticorin Port', coords: { lat: 8.75, lng: 78.35 } },
  { id: 'wp-ec-pamban', name: 'Off Gulf of Mannar Shelf', coords: { lat: 9.10, lng: 79.40 } },
  { id: 'wp-ec-calimere', name: 'Off Point Calimere Buoy', coords: { lat: 10.25, lng: 80.15 } },
  { id: 'wp-ec-nagapattinam', name: 'Off Nagapattinam Roads', coords: { lat: 10.78, lng: 80.10 } },
  { id: 'wp-ec-cuddalore', name: 'Off Cuddalore Anchorage', coords: { lat: 11.75, lng: 80.05 } },
  { id: 'wp-ec-puducherry', name: 'Off Puducherry Roadstead', coords: { lat: 11.95, lng: 80.08 } },
  { id: 'wp-ec-chennai', name: 'Off Chennai Outer Anchorage', coords: { lat: 13.15, lng: 80.40 } },
  { id: 'wp-ec-krishnapatnam', name: 'Off Krishnapatnam', coords: { lat: 14.25, lng: 80.30 } },
  { id: 'wp-ec-machilipatnam', name: 'Off Krishna-Godavari Basin', coords: { lat: 16.05, lng: 81.40 } },
  { id: 'wp-ec-vizag', name: 'Off Visakhapatnam Fairway', coords: { lat: 17.65, lng: 83.40 } },
  { id: 'wp-ec-paradip', name: 'Off Paradip Approaches', coords: { lat: 20.25, lng: 86.95 } },
];

export function calculatePolylineDistanceKm(points: Coordinates[]): number {
  let dist = 0;
  for (let i = 0; i < points.length - 1; i++) {
    dist += haversineDistanceKm(points[i].lat, points[i].lng, points[i + 1].lat, points[i + 1].lng);
  }
  return +dist.toFixed(2);
}

export function generateMaritimeSeaRoute(
  departure: Coordinates,
  destination: Coordinates
): MaritimeRouteResult {
  const directKm = haversineDistanceKm(departure.lat, departure.lng, destination.lat, destination.lng);
  const directNm = +(directKm / 1.852).toFixed(1);
  const directBearing = calculateBearingDegrees(departure.lat, departure.lng, destination.lat, destination.lng);
  const directCardinal = bearingToCompass(directBearing);

  // Coast classification
  const isDepWest = departure.lng < 77.5 && departure.lat >= 7.8;
  const isDepEast = departure.lng >= 77.8 && departure.lat >= 7.8;
  const isDestWest = destination.lng < 77.5 && destination.lat >= 7.8;
  const isDestEast = destination.lng >= 77.8 && destination.lat >= 7.8;

  const isCrossPeninsular = (isDepWest && isDestEast) || (isDepEast && isDestWest);

  // 1. Cross-peninsular navigation: MUST route around Cape Comorin South TSS
  if (isCrossPeninsular) {
    const routePoints: Coordinates[] = [departure];
    const routeMarkers: SeaWaypoint[] = [
      { id: 'dep', name: 'Departure Port', coords: departure, isDeparture: true },
    ];

    if (isDepWest && isDestEast) {
      // Outbound from West Coast down to Cape Comorin, then up East Coast
      const westLegs = WEST_COAST_CORRIDOR.filter((wp) => wp.coords.lat <= departure.lat + 0.5).sort(
        (a, b) => b.coords.lat - a.coords.lat
      );
      westLegs.forEach((wp) => {
        routePoints.push(wp.coords);
        routeMarkers.push(wp);
      });

      // Cape Comorin passage
      CAPE_COMORIN_PASSAGE.forEach((wp) => {
        routePoints.push(wp.coords);
        routeMarkers.push(wp);
      });

      // East Coast up to destination latitude
      const eastLegs = EAST_COAST_CORRIDOR.filter((wp) => wp.coords.lat <= destination.lat + 0.3).sort(
        (a, b) => a.coords.lat - b.coords.lat
      );
      eastLegs.forEach((wp) => {
        routePoints.push(wp.coords);
        routeMarkers.push(wp);
      });
    } else {
      // Outbound from East Coast down to Cape Comorin, then up West Coast
      const eastLegs = EAST_COAST_CORRIDOR.filter((wp) => wp.coords.lat <= departure.lat + 0.5).sort(
        (a, b) => b.coords.lat - a.coords.lat
      );
      eastLegs.forEach((wp) => {
        routePoints.push(wp.coords);
        routeMarkers.push(wp);
      });

      // Cape Comorin passage reversed
      [...CAPE_COMORIN_PASSAGE].reverse().forEach((wp) => {
        routePoints.push(wp.coords);
        routeMarkers.push(wp);
      });

      // West Coast up to destination latitude
      const westLegs = WEST_COAST_CORRIDOR.filter((wp) => wp.coords.lat <= destination.lat + 0.3).sort(
        (a, b) => a.coords.lat - b.coords.lat
      );
      westLegs.forEach((wp) => {
        routePoints.push(wp.coords);
        routeMarkers.push(wp);
      });
    }

    routePoints.push(destination);
    routeMarkers.push({ id: 'dest', name: 'Target Destination', coords: destination, isDestination: true });

    const totalDistanceKm = calculatePolylineDistanceKm(routePoints);
    const totalDistanceNm = +(totalDistanceKm / 1.852).toFixed(1);

    return {
      waypoints: routePoints,
      waypointMarkers: routeMarkers,
      isCrossPeninsular: true,
      isCoastalTransit: true,
      totalDistanceKm,
      totalDistanceNm,
      bearingDegrees: directBearing,
      compassDirection: directCardinal,
      routeTitle: 'Cape Comorin Deep-Water Maritime Corridor',
      passagesDescription:
        'Circumnavigates the Indian peninsula via the Cape Comorin South Traffic Separation Scheme (TSS) and open ocean shelf.',
    };
  }

  // 2. Same-coast long distance (> 60 NM) or rounding Point Calimere
  const isPointCalimereRounding =
    isDepEast &&
    isDestEast &&
    ((departure.lat < 10.2 && destination.lat > 10.3) || (departure.lat > 10.3 && destination.lat < 10.2));

  if (isPointCalimereRounding || (directKm > 120 && (isDepEast || isDepWest))) {
    const routePoints: Coordinates[] = [departure];
    const routeMarkers: SeaWaypoint[] = [
      { id: 'dep', name: 'Departure Port', coords: departure, isDeparture: true },
    ];

    const corridor = isDepEast ? EAST_COAST_CORRIDOR : WEST_COAST_CORRIDOR;
    const minLat = Math.min(departure.lat, destination.lat);
    const maxLat = Math.max(departure.lat, destination.lat);

    const midWaypoints = corridor
      .filter((wp) => wp.coords.lat >= minLat - 0.2 && wp.coords.lat <= maxLat + 0.2)
      .sort((a, b) =>
        departure.lat < destination.lat ? a.coords.lat - b.coords.lat : b.coords.lat - a.coords.lat
      );

    midWaypoints.forEach((wp) => {
      routePoints.push(wp.coords);
      routeMarkers.push(wp);
    });

    routePoints.push(destination);
    routeMarkers.push({ id: 'dest', name: 'Target Destination', coords: destination, isDestination: true });

    const totalDistanceKm = calculatePolylineDistanceKm(routePoints);
    const totalDistanceNm = +(totalDistanceKm / 1.852).toFixed(1);

    return {
      waypoints: routePoints,
      waypointMarkers: routeMarkers,
      isCrossPeninsular: false,
      isCoastalTransit: true,
      totalDistanceKm,
      totalDistanceNm,
      bearingDegrees: directBearing,
      compassDirection: directCardinal,
      routeTitle: isDepEast ? 'Coromandel Coastal Maritime Track' : 'Malabar Coastal Maritime Track',
      passagesDescription: 'Follows official coastal offshore navigation corridor safely clear of headlands.',
    };
  }

  // 3. Direct offshore sea route (same coastal sector or localized fishing zone)
  const routePoints: Coordinates[] = [departure, destination];
  return {
    waypoints: routePoints,
    waypointMarkers: [
      { id: 'dep', name: 'Departure Port', coords: departure, isDeparture: true },
      { id: 'dest', name: 'Target Destination', coords: destination, isDestination: true },
    ],
    isCrossPeninsular: false,
    isCoastalTransit: false,
    totalDistanceKm: directKm,
    totalDistanceNm: directNm,
    bearingDegrees: directBearing,
    compassDirection: directCardinal,
    routeTitle: 'Direct Ocean Transit',
    passagesDescription: 'Direct sea course within coastal operational sector.',
  };
}

export function calculateVoyagePlan(params: {
  vessel: VesselType;
  departureCoords: Coordinates;
  targetCoords: Coordinates;
  fishingDurationHours: number;
  crewCount: number;
  fuelPricePerLiter?: number;
  icePricePerKg?: number; // default ~2.5
  estimatedCatchVolumeKg?: number;
  primaryTargetSpecies?: string;
  seaStateFactor?: number; // 1.0 = calm, 1.15 = moderate, 1.3 = choppy swell
}): VoyageCalculationResult & { seaRoute: MaritimeRouteResult } {
  const {
    vessel,
    departureCoords,
    targetCoords,
    fishingDurationHours,
    crewCount,
    fuelPricePerLiter = vessel.defaultFuelPricePerLiter,
    icePricePerKg = 2.5,
    seaStateFactor = 1.05,
    primaryTargetSpecies = 'Yellowfin Tuna',
  } = params;

  // Generate authentic maritime sea route
  const seaRoute = generateMaritimeSeaRoute(departureCoords, targetCoords);

  const oneWayDistanceKm = seaRoute.totalDistanceKm;
  const oneWayDistanceNm = seaRoute.totalDistanceNm;
  const roundTripDistanceKm = +(oneWayDistanceKm * 2).toFixed(1);
  const roundTripDistanceNm = +(oneWayDistanceNm * 2).toFixed(1);

  const bearingDegrees = seaRoute.bearingDegrees;
  const compassDirection = seaRoute.compassDirection;

  // Transit time at cruise speed with sea state adjustment
  const adjustedSpeed = Math.max(vessel.cruiseSpeedKnots / seaStateFactor, 3.5);
  const transitTimeOneWayHours = +(oneWayDistanceNm / adjustedSpeed).toFixed(2);
  const transitTimeTotalHours = +(transitTimeOneWayHours * 2).toFixed(2);
  const totalVoyageHours = +(transitTimeTotalHours + fishingDurationHours).toFixed(1);
  const totalDays = +(totalVoyageHours / 24).toFixed(1);

  // Fuel Calculations
  // Transit burn + low-throttle trolling/drifting burn while on fishing ground (~35% of cruise burn rate)
  const transitFuelLiters = Math.round(transitTimeTotalHours * vessel.consumptionLitersPerHour * seaStateFactor);
  const fishingFuelLiters = Math.round(fishingDurationHours * (vessel.consumptionLitersPerHour * 0.35));
  // 20% statutory maritime emergency safety margin
  const reserveFuelLiters = Math.round((transitFuelLiters + fishingFuelLiters) * 0.2);
  const totalFuelLiters = transitFuelLiters + fishingFuelLiters + reserveFuelLiters;
  const fuelCostTotalRupees = Math.round(totalFuelLiters * fuelPricePerLiter);

  // Expected Catch Volume
  let expectedCatchKg = params.estimatedCatchVolumeKg;
  if (!expectedCatchKg) {
    // Proportional estimate based on hold capacity and fishing duration
    const holdPct = Math.min(0.25 + (fishingDurationHours / 24) * 0.45, 0.85);
    expectedCatchKg = Math.round(vessel.fishHoldCapacityKg * holdPct);
  }

  // Ice calculation (1:1.2 ratio of fish to ice in tropical marine waters)
  const iceRequiredKg = Math.round(expectedCatchKg * 1.25);
  const iceRequiredTons = +(iceRequiredKg / 1000).toFixed(2);
  const iceCostTotalRupees = Math.round(iceRequiredKg * icePricePerKg);

  // Water & Provisions
  // Fresh drinking water: 4.5 liters per crew per day + 1 day contingency
  const voyageDaysWithReserve = Math.ceil(totalVoyageHours / 24) + 1;
  const drinkingWaterLiters = Math.round(crewCount * 4.5 * voyageDaysWithReserve);
  // Provisions (food, ration, tea, LPG/stove): approx ₹350 per crew member per day
  const provisionsCostRupees = Math.round(crewCount * 350 * voyageDaysWithReserve);
  // Port / Jetty clearance fee
  const portLevyCostRupees = vessel.category === 'traditional' ? 150 : vessel.category === 'motorized' ? 350 : 850;

  const totalOperatingCostRupees =
    fuelCostTotalRupees + iceCostTotalRupees + provisionsCostRupees + portLevyCostRupees;

  // Expected Revenue
  const pricePerKg = COMMON_SPECIES_PRICES[primaryTargetSpecies] || 220;
  const expectedGrossRevenueRupees = Math.round(expectedCatchKg * pricePerKg);
  const projectedNetProfitRupees = expectedGrossRevenueRupees - totalOperatingCostRupees;
  const breakEvenCatchKg = Math.round(totalOperatingCostRupees / pricePerKg);
  const roiPercentage = +(
    (projectedNetProfitRupees / Math.max(totalOperatingCostRupees, 1)) *
    100
  ).toFixed(1);

  return {
    oneWayDistanceKm,
    oneWayDistanceNm,
    roundTripDistanceKm,
    roundTripDistanceNm,
    bearingDegrees,
    compassDirection,
    transitTimeOneWayHours,
    transitTimeTotalHours,
    fishingDurationHours,
    totalVoyageHours,
    totalDays,
    transitFuelLiters,
    fishingFuelLiters,
    reserveFuelLiters,
    totalFuelLiters,
    fuelCostTotalRupees,
    iceRequiredKg,
    iceRequiredTons,
    iceCostTotalRupees,
    drinkingWaterLiters,
    provisionsCostRupees,
    portLevyCostRupees,
    totalOperatingCostRupees,
    expectedCatchKg,
    expectedGrossRevenueRupees,
    projectedNetProfitRupees,
    breakEvenCatchKg,
    roiPercentage,
    seaRoute,
  };
}
