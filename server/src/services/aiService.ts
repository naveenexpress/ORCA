import { prisma } from '../prisma';

export interface GroundTruthData {
  location?: {
    name?: string;
    lat?: number;
    lng?: number;
    district?: string;
    state?: string;
    source?: string;
  };
  weather?: {
    temp?: number;
    feelsLike?: number;
    humidity?: number;
    pressure?: number;
    windSpeedKnots?: number;
    windSpeedKmh?: number;
    windDeg?: number;
    windCardinal?: string;
    visibilityKm?: number;
    description?: string;
    waveEstimate?: string;
    seaStatus?: 'SAFE TO VENTURE' | 'CAUTION ADVISED' | 'ROUGH SEA';
    lastUpdated?: string;
    isLiveData?: boolean;
    isAvailable?: boolean;
  } | null;
  pfz?: {
    advisoryId?: string;
    name?: string;
    landingCentreName?: string;
    state?: string;
    district?: string;
    distanceKm?: number;
    distanceNm?: number;
    directionFromLandingCentre?: string;
    bearingDegrees?: number;
    depth?: number;
    seaSurfaceTemperature?: number;
    chlorophyll?: number;
    confidence?: string;
    targetSpecies?: string[];
    publishedAt?: string;
    isAvailable?: boolean;
  } | null;
  navigation?: {
    nearestHarbourName?: string;
    distanceKm?: number;
    distanceNm?: number;
    bearingDegrees?: number;
    cardinal?: string;
    coordinates?: { lat: number; lng: number };
    isAvailable?: boolean;
  } | null;
  safety?: {
    hotline?: string;
    marinePolice?: string;
    sarVHF?: string;
    emergencySteps?: string[];
  } | null;
}

export interface AIQueryOptions {
  query: string;
  language?: string;
  intent?: string;
  location?: {
    name?: string;
    lat?: number;
    lng?: number;
    district?: string;
    state?: string;
    source?: string;
  };
  groundTruth?: GroundTruthData;
}

export interface AIResponseResult {
  text: string;
  model: string;
  isVerifiedData: boolean;
  sourceCitation: string;
  dataTimestamp?: string;
  groundTruthUsed: {
    locationName: string;
    weatherAvailable: boolean;
    pfzAvailable: boolean;
    navigationAvailable: boolean;
  };
}

export class AIService {
  /**
   * Process a marine query with PostgreSQL access, ground-truth injection, and NVIDIA NIM LLM inference
   */
  public static async processMaritimeQuery(options: AIQueryOptions): Promise<AIResponseResult> {
    const { query, language = 'en', intent = 'general_guidance' } = options;
    const apiKey = (process.env.NVIDIA_NIM_API_KEY || process.env.VITE_NVIDIA_NIM_API_KEY || '').trim();
    const model = process.env.NVIDIA_NIM_MODEL || 'meta/llama-3.2-11b-vision-instruct';

    if (!apiKey) {
      throw new Error('NVIDIA_NIM_API_KEY is not configured on the server');
    }

    // 1. Determine Location
    const locName = options.location?.name || options.groundTruth?.location?.name || 'Kasimedu / Chennai Coast';
    const lat = options.location?.lat ?? options.groundTruth?.location?.lat ?? 13.125;
    const lng = options.location?.lng ?? options.groundTruth?.location?.lng ?? 80.298;

    // 2. Query PostgreSQL for PFZ if not provided or to ensure fresh DB data
    let pfzData = options.groundTruth?.pfz;
    if (!pfzData) {
      try {
        const queryTerms = [locName, locName.split('/')[0].trim(), locName.split(' ')[0].trim()];
        const matched = await prisma.pfzAdvisory.findFirst({
          where: {
            status: 'published',
            OR: queryTerms.map((term) => ({
              landingCentreName: { contains: term, mode: 'insensitive' as any },
            })),
          },
          orderBy: { publishedAt: 'desc' },
        });

        if (matched) {
          pfzData = {
            advisoryId: matched.advisoryId,
            name: matched.name,
            landingCentreName: matched.landingCentreName,
            state: matched.state,
            district: matched.district,
            distanceKm: matched.distanceKm,
            distanceNm: matched.distanceFromLandingCentre,
            directionFromLandingCentre: matched.directionFromLandingCentre,
            bearingDegrees: matched.bearingDegrees,
            depth: matched.depth,
            seaSurfaceTemperature: matched.seaSurfaceTemperature,
            chlorophyll: matched.chlorophyll,
            confidence: matched.confidence,
            targetSpecies: Array.isArray(matched.targetSpecies) ? (matched.targetSpecies as string[]) : [],
            publishedAt: matched.publishedAt,
            isAvailable: true,
          };
        }
      } catch (dbErr) {
        console.warn('[AIService] DB PFZ lookup error:', dbErr);
      }
    }

    // 3. Assemble Ground-Truth Telemetry
    const weatherData = options.groundTruth?.weather;
    const navData = options.groundTruth?.navigation;

    const weatherAvailable = !!(weatherData && weatherData.isAvailable !== false && weatherData.temp !== undefined);
    const pfzAvailable = !!(pfzData && pfzData.isAvailable !== false && pfzData.name);
    const navAvailable = !!(navData && navData.isAvailable !== false && navData.nearestHarbourName);

    let weatherText = 'LIVE WEATHER SENSOR DATA: UNAVAILABLE FOR THIS SECTOR AT THIS TIME.';
    if (weatherAvailable && weatherData) {
      weatherText = `LIVE WEATHER TELEMETRY (${weatherData.city || locName}):
- Surface Air Temperature: ${weatherData.temp}°C (Feels like: ${weatherData.feelsLike}°C)
- Relative Humidity: ${weatherData.humidity}%, Atmospheric Pressure: ${weatherData.pressure} hPa
- Surface Wind: ${weatherData.windSpeedKnots} knots (${weatherData.windSpeedKmh} km/h), Direction: ${weatherData.windCardinal} (${weatherData.windDeg}°)
- Estimated Sea Swell: ${weatherData.waveEstimate}
- Sea Safety Status: ${weatherData.seaStatus}
- Telemetry Timestamp: ${weatherData.lastUpdated || new Date().toISOString()}`;
    }

    let pfzText = 'POTENTIAL FISHING ZONE (PFZ) ADVISORY: NO SATELLITE PFZ CURRENTLY PUBLISHED FOR THIS SPECIFIC SECTOR TODAY.';
    if (pfzAvailable && pfzData) {
      pfzText = `INCOIS VERIFIED PFZ ADVISORY (#${pfzData.advisoryId}):
- Zone Name: ${pfzData.name} (near ${pfzData.landingCentreName}, ${pfzData.state})
- Bearing & Direction: ${pfzData.directionFromLandingCentre} (${pfzData.bearingDegrees}° compass)
- Distance from Harbour: ${pfzData.distanceKm} km (${pfzData.distanceNm} Nautical Miles)
- Operational Depth: ${pfzData.depth} meters
- Sea Surface Temperature (SST): ${pfzData.seaSurfaceTemperature}°C
- Chlorophyll-a Front: ${pfzData.chlorophyll} mg/m³
- Target Pelagic Species: ${(pfzData.targetSpecies || []).join(', ') || 'Tuna, Mackerel, Sardine'}
- Advisory Confidence: ${pfzData.confidence || 'HIGH'}
- Bulletin Timestamp: ${pfzData.publishedAt || 'Active Today'}`;
    }

    let navText = 'NAVIGATION DATA: General coastal waters.';
    if (navAvailable && navData) {
      navText = `NEAREST HARBOUR & BEARING:
- Closest Port/Harbour: ${navData.nearestHarbourName}
- Nautical Distance: ${navData.distanceKm} km (${navData.distanceNm} Nautical Miles)
- Bearing & Heading: ${navData.cardinal} (${navData.bearingDegrees}°)
- Harbour Coordinates: ${navData.coordinates?.lat?.toFixed(3)}°N, ${navData.coordinates?.lng?.toFixed(3)}°E`;
    }

    const safetyText = `STATUTORY MARITIME RESCUE & SAFETY PROTOCOLS:
- Indian Coast Guard SAR Maritime Rescue Toll-Free Hotline: 1554
- Coastal Marine Police Helpline: 1093
- Marine Emergency Calling Channel: VHF Channel 16 (156.800 MHz)
- Venturing Guideline: If wind speed >= 24 knots or sea status is ROUGH SEA, venturing out is strictly dangerous.`;

    // 4. Construct Grounded Prompt
    const systemPrompt = `You are the ORCA Maritime Intelligence AI Assistant, an ocean reasoning copilot for Indian fishermen, boat operators, coastal extension agents, and SAR authorities.
You assist users with real-time Potential Fishing Zones (PFZ), ocean weather, swell/wave safety, navigation compass bearings, and maritime emergency protocols.

VERIFIED GROUND-TRUTH DATA (SOURCED DIRECTLY FROM ORCA SENSORS, POSTGRESQL & INCOIS):
Requested Location: ${locName} (Coordinates: ${lat.toFixed(3)}°N, ${lng.toFixed(3)}°E)

---
${weatherText}

---
${pfzText}

---
${navText}

---
${safetyText}
---

CRITICAL OPERATIONAL INSTRUCTIONS:
1. STRICT ZERO-HALLUCINATION: Base your entire answer ONLY on the Ground-Truth Data above.
2. NEVER invent, assume, or estimate temperatures, wind speeds, wave heights, fish species, coordinates, or emergency numbers not stated in the Ground-Truth Data.
3. UNAVAILABLE DATA: If weather or PFZ is marked "UNAVAILABLE" or "NO SATELLITE PFZ CURRENTLY PUBLISHED", clearly and explicitly inform the user that live data is currently unavailable for that location. NEVER guess or invent mock data.
4. SPECIFIC LOCATION: Respond specifically for "${locName}".
5. MARITIME SAFETY FIRST: Always highlight safety precautions (e.g. wind speed, sea state, Coast Guard 1554, VHF Channel 16) if user asks about emergency, venturing safety, or sea conditions.
6. CONCISE & ACTIONABLE: Deliver concise, formatted, direct answers with bullet points for distances, bearings, and temperatures.
7. LANGUAGE: Respond naturally and fluently in language "${language}".`;

    // 5. Query NVIDIA NIM with 10-second timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const nimRes = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: query },
          ],
          max_tokens: 400,
          temperature: 0.1,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!nimRes.ok) {
        const errText = await nimRes.text();
        throw new Error(`NVIDIA NIM HTTP ${nimRes.status}: ${errText.slice(0, 200)}`);
      }

      const nimData: any = await nimRes.json();
      const reply = nimData.choices?.[0]?.message?.content?.trim() || '';

      if (!reply) {
        throw new Error('Received empty inference response from NVIDIA NIM');
      }

      // Source citation
      let sourceCitation = 'ORCA Maritime Reasoning Engine & NVIDIA NIM';
      if (weatherAvailable && pfzAvailable) {
        sourceCitation = 'INCOIS Satellite Oceanography & Live OpenWeather Marine Telemetry';
      } else if (weatherAvailable) {
        sourceCitation = 'Live OpenWeather Marine Telemetry';
      } else if (pfzAvailable) {
        sourceCitation = `INCOIS Satellite Oceanography (Advisory #${pfzData?.advisoryId})`;
      } else if (intent === 'emergency_sos') {
        sourceCitation = 'Indian Coast Guard SAR Protocol / INCOIS Disaster Command';
      }

      return {
        text: reply,
        model: nimData.model || model,
        isVerifiedData: weatherAvailable || pfzAvailable,
        sourceCitation,
        dataTimestamp: weatherData?.lastUpdated || pfzData?.publishedAt || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        groundTruthUsed: {
          locationName: locName,
          weatherAvailable,
          pfzAvailable,
          navigationAvailable: navAvailable,
        },
      };
    } catch (err: any) {
      clearTimeout(timeoutId);
      throw err;
    }
  }
}
