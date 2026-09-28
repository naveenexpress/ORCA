import { describe, expect, it } from 'vitest';
import {
  haversineDistanceKm,
  calculateBearingDegrees,
  bearingToCompass,
  calculateVoyagePlan,
  generateMaritimeSeaRoute,
  VESSEL_PRESETS,
} from '../services/voyageService';

describe('Smart Voyage Planner & Resource Estimator Service', () => {
  it('accurately calculates Haversine nautical distance between coordinates', () => {
    // Kasimedu Chennai to approx 15 NM offshore point
    const lat1 = 13.1252;
    const lon1 = 80.2986;
    const lat2 = 13.25;
    const lon2 = 80.55;

    const distKm = haversineDistanceKm(lat1, lon1, lat2, lon2);
    expect(distKm).toBeGreaterThan(25);
    expect(distKm).toBeLessThan(35);
  });

  it('accurately computes bearing angles and compass cardinal direction', () => {
    const bearingNorth = calculateBearingDegrees(10.0, 80.0, 12.0, 80.0);
    expect(bearingNorth).toBe(0);
    expect(bearingToCompass(bearingNorth)).toBe('N');

    const bearingEast = calculateBearingDegrees(10.0, 80.0, 10.0, 82.0);
    expect(bearingEast).toBe(90);
    expect(bearingToCompass(bearingEast)).toBe('E');
  });

  it('calculates fuel consumption including statutory 20% reserve margin', () => {
    const vessel = VESSEL_PRESETS[0]; // 38ft Mechanized Trawler
    const departureCoords = { lat: 13.1252, lng: 80.2986 };
    const targetCoords = { lat: 13.25, lng: 80.55 };

    const plan = calculateVoyagePlan({
      vessel,
      departureCoords,
      targetCoords,
      fishingDurationHours: 12,
      crewCount: 6,
      fuelPricePerLiter: 94.5,
    });

    expect(plan.transitTimeTotalHours).toBeGreaterThan(0);
    expect(plan.totalFuelLiters).toBeGreaterThan(plan.transitFuelLiters + plan.fishingFuelLiters);
    expect(plan.reserveFuelLiters).toBeGreaterThan(0);
    expect(plan.iceRequiredKg).toBeGreaterThan(0);
    expect(plan.drinkingWaterLiters).toBeGreaterThan(0);
    expect(plan.totalOperatingCostRupees).toBeGreaterThan(0);
  });

  it('correctly models economic profitability and break-even catch weight', () => {
    const vessel = VESSEL_PRESETS[1]; // 28ft FRP boat
    const plan = calculateVoyagePlan({
      vessel,
      departureCoords: { lat: 13.1252, lng: 80.2986 },
      targetCoords: { lat: 13.20, lng: 80.45 },
      fishingDurationHours: 8,
      crewCount: 3,
      primaryTargetSpecies: 'Yellowfin Tuna',
    });

    expect(plan.expectedGrossRevenueRupees).toBeGreaterThan(0);
    expect(plan.breakEvenCatchKg).toBeGreaterThan(0);
    expect(plan.breakEvenCatchKg).toBeLessThan(plan.expectedCatchKg * 3);
  });

  it('generates a true ocean sea route around Cape Comorin when crossing coasts', () => {
    // West Coast (Mangalore) to East Coast (Chennai PFZ)
    const departure = { lat: 12.855, lng: 74.838 };
    const destination = { lat: 13.125, lng: 80.300 };

    const seaRoute = generateMaritimeSeaRoute(departure, destination);

    expect(seaRoute.isCrossPeninsular).toBe(true);
    // Sea route around the cape is ~700-900 NM, not 328 NM over land
    expect(seaRoute.totalDistanceNm).toBeGreaterThan(600);
    expect(seaRoute.waypoints.length).toBeGreaterThan(5);
    // Verifies Cape Comorin South waypoints are included in the transit
    const hasCapeSouth = seaRoute.waypoints.some((wp) => wp.lat < 8.0 && wp.lng > 77.0 && wp.lng < 78.5);
    expect(hasCapeSouth).toBe(true);
  });
});
