import 'dotenv/config';
import { AIService } from '../src/services/aiService';
import { NavigationAgent } from '../../src/services/agents/navigationAgent';
import { LocationService } from '../../src/services/locationService';
import { SEED_PFZ_ADVISORIES } from '../../src/data/seedData';

async function runTestCase(name: string, fn: () => Promise<void>) {
  console.log(`\n==================================================`);
  console.log(`TEST: ${name}`);
  console.log(`==================================================`);
  try {
    await fn();
    console.log(`RESULT: PASS`);
  } catch (err: any) {
    console.error(`RESULT: FAIL - ${err.message}`);
    throw err;
  }
}

async function main() {
  console.log('=== STARTING ORCA AI ASSISTANT REAL INTEGRATION TESTS ===');

  // Test 1: Send "Hello"
  await runTestCase('1. Send "Hello"', async () => {
    const res = await AIService.processMaritimeQuery({
      query: 'Hello! Who are you and how can you help me at sea?',
      language: 'en',
      intent: 'general_guidance',
    });
    console.log('AI Response:\n', res.text);
    if (!res.text || res.text.length < 10) throw new Error('Response too short or empty');
    if (!res.text.toLowerCase().includes('orca') && !res.text.toLowerCase().includes('marine') && !res.text.toLowerCase().includes('assistant')) {
      throw new Error('Response did not identify as ORCA assistant');
    }
  });

  // Test 2: Ask for weather
  await runTestCase('2. Ask for weather near current location', async () => {
    const loc = LocationService.resolveLocation('What is the weather near my fishing location?', SEED_PFZ_ADVISORIES);
    console.log(`Resolved location: ${loc.name} (${loc.lat}, ${loc.lng})`);

    // Live weather data simulation matching MarineWeatherAgent
    const weatherData = {
      temp: 31,
      feelsLike: 36,
      humidity: 78,
      pressure: 1008,
      windSpeedKnots: 14.2,
      windSpeedKmh: 26.3,
      windDeg: 120,
      windCardinal: 'ESE',
      visibilityKm: 9.0,
      waveEstimate: '1.2 — 1.6 m (Moderate Swell)',
      seaStatus: 'CAUTION ADVISED' as const,
      city: loc.name,
      lastUpdated: '13:45 IST',
      isLiveData: true,
      isAvailable: true,
    };

    const res = await AIService.processMaritimeQuery({
      query: 'What is the weather and sea condition near my fishing location?',
      language: 'en',
      intent: 'weather_sea_state',
      location: { name: loc.name, lat: loc.lat, lng: loc.lng },
      groundTruth: {
        location: { name: loc.name, lat: loc.lat, lng: loc.lng },
        weather: weatherData,
      },
    });

    console.log('AI Response:\n', res.text);
    if (!res.text.includes('14.2') && !res.text.includes('CAUTION') && !res.text.includes('Moderate') && !res.text.includes('31')) {
      throw new Error('Response did not incorporate verified weather ground-truth data');
    }
  });

  // Test 3: Ask for nearest PFZ
  await runTestCase("3. Ask for today's nearest PFZ", async () => {
    const loc = LocationService.resolveLocation('Where is today nearest PFZ?', SEED_PFZ_ADVISORIES);
    const adv = loc.matchedAdvisory || SEED_PFZ_ADVISORIES[0];
    console.log(`Target Advisory: ${adv.name} (#${adv.advisoryId})`);

    const res = await AIService.processMaritimeQuery({
      query: "Where is today's nearest PFZ?",
      language: 'en',
      intent: 'pfz_fishing_zone',
      location: { name: adv.landingCentreName, lat: adv.latitude, lng: adv.longitude },
      groundTruth: {
        location: { name: adv.landingCentreName, lat: adv.latitude, lng: adv.longitude },
        pfz: {
          advisoryId: adv.advisoryId,
          name: adv.name,
          landingCentreName: adv.landingCentreName,
          state: adv.state,
          distanceKm: adv.distanceKm,
          distanceNm: adv.distanceFromLandingCentre,
          directionFromLandingCentre: adv.directionFromLandingCentre,
          bearingDegrees: adv.bearingDegrees,
          depth: adv.depth,
          seaSurfaceTemperature: adv.seaSurfaceTemperature,
          chlorophyll: adv.chlorophyll,
          confidence: adv.confidence,
          targetSpecies: adv.targetSpecies,
          publishedAt: adv.publishedAt,
          isAvailable: true,
        },
      },
    });

    console.log('AI Response:\n', res.text);
    if (!res.text.includes(adv.name) && !res.text.includes(`${adv.distanceKm}`) && !res.text.includes(`${adv.depth}`)) {
      throw new Error('Response did not contain verified PFZ numerical telemetry');
    }
  });

  // Test 4: Ask about a DIFFERENT location (Cochin / Kerala)
  await runTestCase('4. Ask about a DIFFERENT location (Cochin, Kerala)', async () => {
    const query = 'What is the sea condition and nearest PFZ in Cochin?';
    const loc = LocationService.resolveLocation(query, SEED_PFZ_ADVISORIES);
    console.log(`Resolved location for "${query}": ${loc.name} (${loc.lat}, ${loc.lng})`);

    if (!loc.name.toLowerCase().includes('cochin') && !loc.name.toLowerCase().includes('kochi')) {
      throw new Error(`Location was not resolved to Cochin! Got: ${loc.name}`);
    }

    const cochinWeather = {
      temp: 29,
      feelsLike: 33,
      humidity: 82,
      pressure: 1010,
      windSpeedKnots: 11.0,
      windSpeedKmh: 20.4,
      windDeg: 260,
      windCardinal: 'W',
      visibilityKm: 10.0,
      waveEstimate: '0.9 — 1.2 m (Slight Swell)',
      seaStatus: 'SAFE TO VENTURE' as const,
      city: 'Cochin (Kochi)',
      lastUpdated: '13:50 IST',
      isLiveData: true,
      isAvailable: true,
    };

    const res = await AIService.processMaritimeQuery({
      query,
      language: 'en',
      intent: 'weather_sea_state',
      location: { name: loc.name, lat: loc.lat, lng: loc.lng },
      groundTruth: {
        location: { name: loc.name, lat: loc.lat, lng: loc.lng },
        weather: cochinWeather,
      },
    });

    console.log('AI Response:\n', res.text);
    if (!res.text.toLowerCase().includes('cochin') && !res.text.toLowerCase().includes('kochi')) {
      throw new Error('Response did not specifically address Cochin');
    }
    if (res.text.toLowerCase().includes('kasimedu')) {
      throw new Error('Response incorrectly defaulted to Kasimedu when Cochin was asked');
    }
  });

  // Test 5: Ask a safety / emergency question
  await runTestCase('5. Ask a safety / emergency question', async () => {
    const res = await AIService.processMaritimeQuery({
      query: 'What should I do during an emergency at sea if my engine breaks down?',
      language: 'en',
      intent: 'emergency_sos',
      groundTruth: {
        safety: {
          hotline: '1554',
          marinePolice: '1093',
          sarVHF: 'Channel 16 (156.800 MHz)',
        },
      },
    });

    console.log('AI Response:\n', res.text);
    if (!res.text.includes('1554')) {
      throw new Error('Safety response missing Coast Guard hotline 1554');
    }
    if (!res.text.includes('16') && !res.text.includes('VHF')) {
      throw new Error('Safety response missing VHF Channel 16');
    }
  });

  // Test 6: Ask for nearest harbour
  await runTestCase('6. Ask for nearest harbour', async () => {
    const nearest = NavigationAgent.findNearestHarbour({ lat: 13.125, lng: 80.298 });
    console.log(`Nearest harbour calculated: ${nearest.harbourName} (${nearest.distanceKm} km, ${nearest.bearingDegrees}°)`);

    const res = await AIService.processMaritimeQuery({
      query: 'What is the nearest harbour and bearing from here?',
      language: 'en',
      intent: 'navigation_harbour',
      groundTruth: {
        location: { name: 'Offshore Coromandel', lat: 13.125, lng: 80.298 },
        navigation: {
          nearestHarbourName: nearest.harbourName,
          distanceKm: nearest.distanceKm,
          distanceNm: nearest.distanceNm,
          bearingDegrees: nearest.bearingDegrees,
          cardinal: nearest.cardinal,
          coordinates: nearest.coordinates,
          isAvailable: true,
        },
      },
    });

    console.log('AI Response:\n', res.text);
    if (!res.text.includes(nearest.harbourName)) {
      throw new Error(`Response did not mention nearest harbour ${nearest.harbourName}`);
    }
  });

  // Test 7: Simulate UNAVAILABLE API Data and confirm zero hallucinations
  await runTestCase('7. Simulate unavailable API data & confirm zero hallucinations', async () => {
    const locName = 'Remote Deep Sea Sector 9';
    const res = await AIService.processMaritimeQuery({
      query: 'What is the sea temperature and wind speed at Remote Deep Sea Sector 9 right now?',
      language: 'en',
      intent: 'weather_sea_state',
      location: { name: locName, lat: 14.5, lng: 84.5 },
      groundTruth: {
        location: { name: locName, lat: 14.5, lng: 84.5 },
        weather: { isAvailable: false }, // EXPLICITLY UNAVAILABLE
        pfz: { isAvailable: false },     // EXPLICITLY UNAVAILABLE
      },
    });

    console.log('AI Response:\n', res.text);
    const lower = res.text.toLowerCase();
    const explicitlyUnavailable =
      lower.includes('unavailable') ||
      lower.includes('not available') ||
      lower.includes('no live') ||
      lower.includes('cannot be fetched') ||
      lower.includes('currently unavailable');

    if (!explicitlyUnavailable) {
      throw new Error('Assistant failed to state that live data is unavailable when data was missing!');
    }

    // Check that it did NOT hallucinate specific numbers
    if (lower.includes('28.') || lower.includes('30.') || lower.includes('15 knots')) {
      throw new Error('Assistant hallucinated specific measurements when marked unavailable!');
    }
    console.log('Verified: Assistant explicitly stated data is unavailable and did NOT invent fake numbers.');
  });

  console.log('\n==================================================');
  console.log('ALL 7 AI INTEGRATION TEST CASES PASSED SUCCESSFULLY!');
  console.log('==================================================\n');
}

main().catch((err) => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
