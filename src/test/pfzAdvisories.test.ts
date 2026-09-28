import { describe,expect,it } from 'vitest';
import { SEED_PFZ_ADVISORIES } from '../data/seedData';

describe('PFZ Advisory Data Model & Integrity', () => {
  it('contains valid INCOIS-compliant simulated advisories', () => {
    expect(SEED_PFZ_ADVISORIES.length).toBeGreaterThanOrEqual(10);

    const firstAdvisory = SEED_PFZ_ADVISORIES[0];
    expect(firstAdvisory.advisoryId).toContain('INCOIS-PFZ');
    expect(firstAdvisory.seaSurfaceTemperature).toBeGreaterThan(20);
    expect(firstAdvisory.chlorophyll).toBeGreaterThan(0);
    expect(firstAdvisory.bearingDegrees).toBeGreaterThanOrEqual(0);
    expect(firstAdvisory.bearingDegrees).toBeLessThanOrEqual(360);
    expect(firstAdvisory.targetSpecies.length).toBeGreaterThan(0);
  });

  it('correctly tags simulated advisory records', () => {
    SEED_PFZ_ADVISORIES.forEach((adv) => {
      expect(adv.isSimulated).toBe(true);
      expect(adv.source).toContain('INCOIS');
    });
  });
});
