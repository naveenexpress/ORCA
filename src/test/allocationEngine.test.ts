import { describe, expect, it } from 'vitest';
import { calculateHaversineDistance, rankAgentsForCase } from '../services/allocationEngine';
import { CaseItem } from '../types';
import { SEED_AGENTS, SEED_ZONES } from '../data/seedData';

describe('ORCA Explainable Multi-Agent Allocation Engine', () => {
  it('calculates Haversine geographic distance accurately', () => {
    // Distance between Chennai (13.0827, 80.2707) and Ennore (13.2185, 80.3214) ~ 16 km
    const dist = calculateHaversineDistance(13.0827, 80.2707, 13.2185, 80.3214);
    expect(dist).toBeGreaterThan(12);
    expect(dist).toBeLessThan(20);
  });

  it('ranks agents based on language match, distance, and workload', () => {
    const mockCase: Partial<CaseItem> = {
      title: 'Kasimedu Tamil Fisherman Guidance',
      coordinates: { lat: 13.1252, lng: 80.2986 },
      language: 'ta',
      priority: 'HIGH',
      requestType: 'PFZ Advisory Clarification',
    };

    const ranked = rankAgentsForCase(mockCase, SEED_AGENTS, SEED_ZONES);
    expect(ranked.length).toBeGreaterThan(0);

    // Top ranked agent should be fluent in Tamil (ta) and close to Chennai
    const topMatch = ranked[0];
    expect(topMatch.matchedLanguages).toContain('ta');
    expect(topMatch.score).toBeGreaterThan(70);
    expect(topMatch.reasonText).toContain('Assigned to');
    expect(topMatch.reasonText).toContain('direct language match');
  });
});
