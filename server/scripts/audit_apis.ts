import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

export interface AuditReportItem {
  service: string;
  status: 'PASS' | 'FAIL';
  httpStatus: number;
  endpoint: string;
  envVar: string;
  location: string;
  parsing: string;
  error?: string;
  recommendedFix?: string;
}

// 1. OpenWeather
async function testOpenWeather(): Promise<AuditReportItem> {
  const envVar = 'OPENWEATHER_API_KEY';
  const location = 'Backend: server/scripts/audit_apis.ts (previously referenced frontend)';
  const key = process.env.OPENWEATHER_API_KEY || '';


  if (!key) {
    return {
      service: 'OpenWeather',
      status: 'FAIL',
      httpStatus: 0,
      endpoint: 'https://api.openweathermap.org/data/2.5/weather',
      envVar,
      location,
      parsing: 'Failed: Missing API Key',
      error: 'OPENWEATHER_API_KEY is not defined in .env',
      recommendedFix: 'Provide a valid OpenWeather API key in .env',
    };
  }

  const endpoint = `https://api.openweathermap.org/data/2.5/weather?lat=13.0827&lon=80.2707&appid=${key}&units=metric`;
  const sanitizedEndpoint = endpoint.replace(key, '[REDACTED]');

  try {
    const res = await fetch(endpoint);
    const httpStatus = res.status;
    if (!res.ok) {
      const errText = await res.text();
      return {
        service: 'OpenWeather',
        status: 'FAIL',
        httpStatus,
        endpoint: sanitizedEndpoint,
        envVar,
        location,
        parsing: 'Failed to parse weather JSON',
        error: `HTTP ${httpStatus}: ${errText}`,
        recommendedFix: 'Verify API key permissions and activation on OpenWeatherMap portal',
      };
    }

    const data: any = await res.json();
    const isValid =
      typeof data.main?.temp === 'number' &&
      Array.isArray(data.weather) &&
      typeof data.wind?.speed === 'number';

    if (!isValid) {
      return {
        service: 'OpenWeather',
        status: 'FAIL',
        httpStatus,
        endpoint: sanitizedEndpoint,
        envVar,
        location,
        parsing: 'JSON schema invalid: missing expected temperature/weather/wind fields',
        error: 'Malformed response structure',
        recommendedFix: 'Verify OpenWeather 2.5 API schema compatibility',
      };
    }

    return {
      service: 'OpenWeather',
      status: 'PASS',
      httpStatus,
      endpoint: sanitizedEndpoint,
      envVar,
      location,
      parsing: `Verified: temp=${data.main.temp}°C, conditions="${data.weather[0]?.description}", windSpeed=${data.wind.speed} m/s, humidity=${data.main.humidity}%`,
    };
  } catch (err: any) {
    return {
      service: 'OpenWeather',
      status: 'FAIL',
      httpStatus: 0,
      endpoint: sanitizedEndpoint,
      envVar,
      location,
      parsing: 'Network error',
      error: err.message,
      recommendedFix: 'Check Internet connection and DNS resolution for api.openweathermap.org',
    };
  }
}

// 2. CARTO
async function testCarto(): Promise<AuditReportItem> {
  const envVar = 'VITE_CARTO_API_KEY';
  const location = 'Frontend: src/components/map/MarineMap.tsx, src/store/mapStore.ts';
  const key = (process.env.VITE_CARTO_API_KEY || process.env.CARTO_API_KEY || '').trim();
  const endpoint = key
    ? `https://a.basemaps.cartocdn.com/dark_all/7/93/60.png?key=${encodeURIComponent(key)}`
    : `https://a.basemaps.cartocdn.com/dark_all/7/93/60.png`;
  const sanitizedEndpoint = key ? endpoint.replace(key, '[REDACTED]') : endpoint;

  try {
    const res = await fetch(endpoint);
    const httpStatus = res.status;
    const contentType = res.headers.get('content-type') || '';
    const isImage = res.ok && contentType.includes('image');

    if (!isImage) {
      return {
        service: 'CARTO',
        status: 'FAIL',
        httpStatus,
        endpoint: sanitizedEndpoint,
        envVar,
        location,
        parsing: 'Failed: Tile response is not a valid image',
        error: `HTTP ${httpStatus}, Content-Type: ${contentType}`,
        recommendedFix: 'Verify CARTO basemaps API key and access limits at carto.com/basemaps',
      };
    }

    return {
      service: 'CARTO',
      status: 'PASS',
      httpStatus,
      endpoint: sanitizedEndpoint,
      envVar,
      location,
      parsing: `Verified: Valid raster tile received (${contentType}, ${res.headers.get('content-length') || 'chunked'} bytes)`,
    };
  } catch (err: any) {
    return {
      service: 'CARTO',
      status: 'FAIL',
      httpStatus: 0,
      endpoint: sanitizedEndpoint,
      envVar,
      location,
      parsing: 'Network error',
      error: err.message,
      recommendedFix: 'Check outbound HTTPS connectivity to basemaps.cartocdn.com',
    };
  }
}

// 3. Mapbox
async function testMapbox(): Promise<AuditReportItem> {
  const envVar = 'VITE_MAPBOX_TOKEN';
  const location = 'Frontend: src/components/map/MarineMap.tsx';
  const token = (process.env.VITE_MAPBOX_TOKEN || process.env.MAPBOX_TOKEN || '').trim();

  if (!token) {
    return {
      service: 'Mapbox',
      status: 'FAIL',
      httpStatus: 0,
      endpoint: 'https://api.mapbox.com/styles/v1/mapbox/dark-v11',
      envVar,
      location,
      parsing: 'Missing Mapbox Access Token',
      error: 'VITE_MAPBOX_TOKEN not configured',
      recommendedFix: 'Create a public Mapbox token at account.mapbox.com and set VITE_MAPBOX_TOKEN',
    };
  }

  const endpoint = `https://api.mapbox.com/styles/v1/mapbox/dark-v11/tiles/256/7/93/60@2x?access_token=${token}`;
  const sanitizedEndpoint = endpoint.replace(token, '[REDACTED]');

  try {
    const res = await fetch(endpoint);
    const httpStatus = res.status;
    const contentType = res.headers.get('content-type') || '';
    const isImage = res.ok && contentType.includes('image');

    if (!isImage) {
      const errText = await res.text();
      return {
        service: 'Mapbox',
        status: 'FAIL',
        httpStatus,
        endpoint: sanitizedEndpoint,
        envVar,
        location,
        parsing: 'Failed: Tile response is not a valid image',
        error: `HTTP ${httpStatus}: ${errText.slice(0, 150)}`,
        recommendedFix: 'Ensure Mapbox access token has styles:tiles scope enabled',
      };
    }

    return {
      service: 'Mapbox',
      status: 'PASS',
      httpStatus,
      endpoint: sanitizedEndpoint,
      envVar,
      location,
      parsing: `Verified: Valid retina vector/raster style tile received (${contentType})`,
    };
  } catch (err: any) {
    return {
      service: 'Mapbox',
      status: 'FAIL',
      httpStatus: 0,
      endpoint: sanitizedEndpoint,
      envVar,
      location,
      parsing: 'Network error',
      error: err.message,
      recommendedFix: 'Verify network connection to api.mapbox.com',
    };
  }
}

// 4. NASA FIRMS
async function testNasaFirms(): Promise<AuditReportItem> {
  const envVar = 'VITE_NASA_FIRMS_MAP_KEY';
  const location = 'Frontend: src/components/map/MarineMap.tsx (WMSTileLayer)';
  const key = (process.env.VITE_NASA_FIRMS_MAP_KEY || process.env.NASA_FIRMS_MAP_KEY || '').trim();

  if (!key) {
    return {
      service: 'NASA FIRMS',
      status: 'FAIL',
      httpStatus: 0,
      endpoint: 'https://firms.modaps.eosdis.nasa.gov',
      envVar,
      location,
      parsing: 'Missing MAP_KEY',
      error: 'VITE_NASA_FIRMS_MAP_KEY not configured',
      recommendedFix: 'Request a free MAP_KEY at firms.modaps.eosdis.nasa.gov/api/map_key',
    };
  }

  // Test both WMS Capabilities and API endpoint
  const endpoint = `https://firms.modaps.eosdis.nasa.gov/mapserver/wms/fires/${key}/?SERVICE=WMS&REQUEST=GetCapabilities`;
  const sanitizedEndpoint = endpoint.replace(key, '[REDACTED]');

  try {
    const res = await fetch(endpoint);
    const httpStatus = res.status;
    const text = await res.text();
    const isValidWms = res.ok && text.includes('WMT_MS_Capabilities') && text.includes('fires_viirs_snpp');

    if (!isValidWms) {
      return {
        service: 'NASA FIRMS',
        status: 'FAIL',
        httpStatus,
        endpoint: sanitizedEndpoint,
        envVar,
        location,
        parsing: 'WMS XML Capabilities failed or invalid key',
        error: `HTTP ${httpStatus}: ${text.slice(0, 150)}`,
        recommendedFix: 'Verify MAP_KEY validity with NASA EOSDIS FIRMS service',
      };
    }

    return {
      service: 'NASA FIRMS',
      status: 'PASS',
      httpStatus,
      endpoint: sanitizedEndpoint,
      envVar,
      location,
      parsing: 'Verified: WMS 1.1.1 GetCapabilities parsed with layer "fires_viirs_snpp" active',
    };
  } catch (err: any) {
    return {
      service: 'NASA FIRMS',
      status: 'FAIL',
      httpStatus: 0,
      endpoint: sanitizedEndpoint,
      envVar,
      location,
      parsing: 'Network error',
      error: err.message,
      recommendedFix: 'Check outbound connectivity to firms.modaps.eosdis.nasa.gov',
    };
  }
}

// 5. Bhashini
async function testBhashini(): Promise<AuditReportItem> {
  const envVar = 'BHASHINI_USER_ID, BHASHINI_ULCA_API_KEY';
  const location = 'Backend / Config (.env); Not referenced in active codebase (App uses local whisper.cpp & WebSpeech)';
  const userId = (process.env.BHASHINI_USER_ID || process.env.VITE_BHASHINI_USER_ID || '').trim();
  const apiKey = (process.env.BHASHINI_ULCA_API_KEY || process.env.VITE_BHASHINI_ULCA_API_KEY || '').trim();
  const endpoint = 'https://meity-auth.ulcacontrib.org/ulca/apis/v0/model/getModelsPipeline';

  if (!userId || !apiKey) {
    return {
      service: 'Bhashini',
      status: 'FAIL',
      httpStatus: 0,
      endpoint,
      envVar,
      location,
      parsing: `Incomplete credentials: userId="${userId ? '[CONFIGURED]' : '[MISSING]'}", ulcaApiKey="${apiKey ? '[CONFIGURED]' : '[MISSING]'}"`,
      error: 'BHASHINI_USER_ID is empty in environment. Existing voice engine uses local whisper.cpp & WebSpeech.',
      recommendedFix: 'If Bhashini ULCA is required, obtain User ID and Pipeline ID from MeitY ULCA portal. Otherwise keep in backend env without exposing via VITE_.',
    };
  }

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        userID: userId,
        ulcaApiKey: apiKey,
      },
      body: JSON.stringify({
        pipelineTasks: [{ taskType: 'asr', config: { language: { sourceLanguage: 'hi' } } }],
        pipelineRequestConfig: { pipelineId: '64392f96daac500b55c543d8' },
      }),
    });
    const httpStatus = res.status;
    const body = await res.text();
    const pass = res.ok;

    return {
      service: 'Bhashini',
      status: pass ? 'PASS' : 'FAIL',
      httpStatus,
      endpoint,
      envVar,
      location,
      parsing: pass ? 'Verified: Pipeline config received' : `Authentication failed: ${body.slice(0, 150)}`,
      error: pass ? undefined : `HTTP ${httpStatus}`,
      recommendedFix: pass ? undefined : 'Verify Bhashini ULCA API key and User ID pairing with MeitY ULCA.',
    };
  } catch (err: any) {
    return {
      service: 'Bhashini',
      status: 'FAIL',
      httpStatus: 0,
      endpoint,
      envVar,
      location,
      parsing: 'Network error',
      error: err.message,
      recommendedFix: 'Check network access to meity-auth.ulcacontrib.org',
    };
  }
}

// 6. NVIDIA NIM
async function testNvidiaNim(): Promise<AuditReportItem> {
  const envVar = 'NVIDIA_NIM_API_KEY, NVIDIA_NIM_MODEL';
  const location = 'Backend: server/src/routes.ts (POST /api/ai/chat)';
  const key = (process.env.NVIDIA_NIM_API_KEY || process.env.VITE_NVIDIA_NIM_API_KEY || '').trim();
  const model = process.env.NVIDIA_NIM_MODEL || 'meta/llama-3.2-11b-vision-instruct';
  const endpoint = 'https://integrate.api.nvidia.com/v1/chat/completions';

  if (!key) {
    return {
      service: 'NVIDIA NIM',
      status: 'FAIL',
      httpStatus: 0,
      endpoint,
      envVar,
      location,
      parsing: 'Missing API Key',
      error: 'NVIDIA_NIM_API_KEY is not defined',
      recommendedFix: 'Obtain an API key from build.nvidia.com and store in backend NVIDIA_NIM_API_KEY',
    };
  }

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: 'Say "ORCA_NIM_OK"' }],
        max_tokens: 15,
        temperature: 0.1,
      }),
    });

    const httpStatus = res.status;
    const data: any = await res.json();

    if (!res.ok) {
      return {
        service: 'NVIDIA NIM',
        status: 'FAIL',
        httpStatus,
        endpoint,
        envVar,
        location,
        parsing: 'Inference request failed',
        error: `HTTP ${httpStatus}: ${JSON.stringify(data).slice(0, 150)}`,
        recommendedFix:
          httpStatus === 410
            ? 'The previously selected model has reached End-Of-Life. Update NVIDIA_NIM_MODEL to an active model (e.g. meta/llama-3.2-11b-vision-instruct).'
            : 'Check NIM API key authorization and quotas on NVIDIA build portal.',
      };
    }

    const reply = data.choices?.[0]?.message?.content || '';
    const pass = reply.length > 0;

    return {
      service: 'NVIDIA NIM',
      status: pass ? 'PASS' : 'FAIL',
      httpStatus,
      endpoint,
      envVar,
      location,
      parsing: pass
        ? `Verified: Model "${data.model || model}" generated reply "${reply.trim()}" (Tokens: prompt=${data.usage?.prompt_tokens}, completion=${data.usage?.completion_tokens})`
        : 'Inference returned empty content',
    };
  } catch (err: any) {
    return {
      service: 'NVIDIA NIM',
      status: 'FAIL',
      httpStatus: 0,
      endpoint,
      envVar,
      location,
      parsing: 'Network error',
      error: err.message,
      recommendedFix: 'Verify outbound connectivity to integrate.api.nvidia.com',
    };
  }
}

// 7. Hugging Face
async function testHuggingFace(): Promise<AuditReportItem> {
  const envVar = 'HUGGINGFACE_API_KEY';
  const location = 'Backend / Config (.env); Not invoked in active frontend/backend application flow';
  const key = (process.env.HUGGINGFACE_API_KEY || process.env.VITE_HUGGINGFACE_API_KEY || '').trim();
  const endpoint = 'https://huggingface.co/api/whoami-v2';

  if (!key) {
    return {
      service: 'Hugging Face',
      status: 'FAIL',
      httpStatus: 0,
      endpoint,
      envVar,
      location,
      parsing: 'No Hugging Face token found',
      error: 'HUGGINGFACE_API_KEY not set',
      recommendedFix: 'Application does not currently use Hugging Face. Keep secret on server if needed.',
    };
  }

  try {
    const res = await fetch(endpoint, {
      headers: { Authorization: `Bearer ${key}` },
    });
    const httpStatus = res.status;
    const data: any = await res.json();
    const pass = res.ok && !!(data.name || data.type);

    return {
      service: 'Hugging Face',
      status: pass ? 'PASS' : 'FAIL',
      httpStatus,
      endpoint,
      envVar,
      location,
      parsing: pass
        ? `Verified: Token valid for user "${data.name}" (${data.type}) with orgs [${data.orgs?.map((o: any) => o.name).join(', ') || 'none'}]`
        : `Authentication failed: ${JSON.stringify(data)}`,
      error: pass ? undefined : `HTTP ${httpStatus}`,
      recommendedFix: 'Hugging Face is not actively invoked in current application features; move out of VITE_ to backend variable.',
    };
  } catch (err: any) {
    return {
      service: 'Hugging Face',
      status: 'FAIL',
      httpStatus: 0,
      endpoint,
      envVar,
      location,
      parsing: 'Network error',
      error: err.message,
      recommendedFix: 'Check connection to huggingface.co',
    };
  }
}

// 8. Copernicus
async function testCopernicus(): Promise<AuditReportItem> {
  const envVar = 'COPERNICUS_USERNAME, COPERNICUS_PASSWORD';
  const location = 'Backend / Config (.env); Not referenced in active codebase (App uses INCOIS open feeds)';
  const user = (process.env.COPERNICUS_USERNAME || process.env.VITE_COPERNICUS_USERNAME || '').trim();
  const pass = (process.env.COPERNICUS_PASSWORD || process.env.VITE_COPERNICUS_PASSWORD || '').trim();
  const endpoint = 'https://identity.dataspace.copernicus.eu/auth/realms/CDSE/protocol/openid-connect/token';

  if (!user || !pass) {
    return {
      service: 'Copernicus',
      status: 'FAIL',
      httpStatus: 0,
      endpoint,
      envVar,
      location,
      parsing: 'Credentials missing in .env (Username and password are empty strings)',
      error: 'Empty Copernicus credentials. Also, was previously insecurely exposed as VITE_ variables.',
      recommendedFix:
        'Copernicus is not required by current application (which uses official INCOIS feeds). Keep credentials in backend env variables without VITE_ prefix if integrating in future.',
    };
  }

  try {
    const params = new URLSearchParams();
    params.append('client_id', 'cdse-public');
    params.append('username', user);
    params.append('password', pass);
    params.append('grant_type', 'password');

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });
    const httpStatus = res.status;
    const data: any = await res.json();
    const success = res.ok && !!data.access_token;

    return {
      service: 'Copernicus',
      status: success ? 'PASS' : 'FAIL',
      httpStatus,
      endpoint,
      envVar,
      location,
      parsing: success ? 'Verified: OpenID token generated' : `Auth failed: ${JSON.stringify(data).slice(0, 150)}`,
      error: success ? undefined : `HTTP ${httpStatus}`,
    };
  } catch (err: any) {
    return {
      service: 'Copernicus',
      status: 'FAIL',
      httpStatus: 0,
      endpoint,
      envVar,
      location,
      parsing: 'Network error',
      error: err.message,
    };
  }
}

// 9. PostgreSQL (Prisma)
async function testPostgreSql(): Promise<AuditReportItem> {
  const envVar = 'DATABASE_URL';
  const location = 'Backend: server/prisma/schema.prisma, server/src/prisma.ts';
  const endpoint = 'postgresql://localhost:5432/orca';
  const prisma = new PrismaClient();

  try {
    await prisma.$connect();
    // Safe read test: count records in User and PfzAdvisory models
    const userCount = await prisma.user.count();
    const pfzCount = await prisma.pfzAdvisory.count();
    const sampleUsers = await prisma.user.findMany({
      take: 2,
      select: { id: true, name: true, email: true, role: true },
    });
    await prisma.$disconnect();

    return {
      service: 'PostgreSQL (Prisma)',
      status: 'PASS',
      httpStatus: 200,
      endpoint,
      envVar,
      location,
      parsing: `Verified: Connected to PostgreSQL DB. Safe read completed: ${userCount} users, ${pfzCount} PFZ advisories. Active sample: "${sampleUsers[0]?.email || 'N/A'}" (${sampleUsers[0]?.role || 'N/A'})`,
    };
  } catch (err: any) {
    await prisma.$disconnect().catch(() => {});
    return {
      service: 'PostgreSQL (Prisma)',
      status: 'FAIL',
      httpStatus: 500,
      endpoint,
      envVar,
      location,
      parsing: 'Database connection failed',
      error: err.message?.split('\n')?.[0] || err.message,
      recommendedFix: 'Ensure PostgreSQL service is running on port 5432 and database "orca" exists.',
    };
  }
}

// 10. Marine Data Source
async function testMarineDataSource(): Promise<AuditReportItem> {
  const envVar = 'None (Public Government Agency Open Access)';
  const location = 'Frontend: src/pages/DataSourcesPage.tsx, src/services/agents/marineWeatherAgent.ts, src/data/seedData.ts';
  const endpoint = 'https://incois.gov.in/MarineFisheries/PfzAdvisory';

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 9000);
    const res = await fetch(endpoint, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });
    clearTimeout(timeout);
    const httpStatus = res.status;
    const text = await res.text();
    const isValid = res.ok && (text.includes('Potential Fishing Zone') || text.includes('INCOIS') || text.includes('Advisory'));

    if (!isValid) {
      return {
        service: 'Marine data source (INCOIS)',
        status: 'FAIL',
        httpStatus,
        endpoint,
        envVar,
        location,
        parsing: 'Failed: INCOIS advisory page did not return expected content',
        error: `HTTP ${httpStatus}`,
        recommendedFix: 'Verify INCOIS Web GIS portal availability or mirror endpoints',
      };
    }

    return {
      service: 'Marine data source (INCOIS)',
      status: 'PASS',
      httpStatus,
      endpoint,
      envVar,
      location,
      parsing: `Verified: INCOIS ocean advisory portal responded (${text.length} bytes, content verified for Marine Fisheries Advisory)`,
    };
  } catch (err: any) {
    return {
      service: 'Marine data source (INCOIS)',
      status: 'FAIL',
      httpStatus: 0,
      endpoint,
      envVar,
      location,
      parsing: 'Request failed',
      error: err.message,
      recommendedFix: 'Verify outbound Internet connectivity to incois.gov.in',
    };
  }
}

// 11. AI Assistant
async function testAiAssistant(): Promise<AuditReportItem> {
  const envVar = 'NVIDIA_NIM_API_KEY, NVIDIA_NIM_MODEL';
  const location = 'Frontend: src/services/chatService.ts; Backend: server/src/routes.ts (POST /api/ai/chat)';
  const key = (process.env.NVIDIA_NIM_API_KEY || process.env.VITE_NVIDIA_NIM_API_KEY || '').trim();
  const model = process.env.NVIDIA_NIM_MODEL || 'meta/llama-3.2-11b-vision-instruct';
  const endpoint = 'https://integrate.api.nvidia.com/v1/chat/completions';

  if (!key) {
    return {
      service: 'AI Assistant',
      status: 'FAIL',
      httpStatus: 0,
      endpoint,
      envVar,
      location,
      parsing: 'Missing API Key',
      error: 'NVIDIA_NIM_API_KEY not configured',
      recommendedFix: 'Configure NVIDIA_NIM_API_KEY in backend environment',
    };
  }

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: 'You are the ORCA Maritime AI Assistant. Keep response under 25 words.' },
          { role: 'user', content: 'What is the safe depth and heading for Kasimedu harbour?' },
        ],
        max_tokens: 60,
        temperature: 0.1,
      }),
    });

    const httpStatus = res.status;
    const data: any = await res.json();

    if (!res.ok) {
      return {
        service: 'AI Assistant',
        status: 'FAIL',
        httpStatus,
        endpoint,
        envVar,
        location,
        parsing: 'LLM inference request failed',
        error: `HTTP ${httpStatus}: ${JSON.stringify(data).slice(0, 150)}`,
        recommendedFix:
          httpStatus === 410
            ? 'The requested model has reached End-Of-Life on NVIDIA NIM. Update model to meta/llama-3.2-11b-vision-instruct.'
            : 'Check API key quotas and permissions.',
      };
    }

    const reply = data.choices?.[0]?.message?.content || '';
    const pass = reply.length > 0;

    return {
      service: 'AI Assistant',
      status: pass ? 'PASS' : 'FAIL',
      httpStatus,
      endpoint,
      envVar,
      location,
      parsing: pass
        ? `Verified: Actual LLM inference returned "${reply.trim()}" (Model: ${data.model || model})`
        : 'Received empty reply from LLM',
    };
  } catch (err: any) {
    return {
      service: 'AI Assistant',
      status: 'FAIL',
      httpStatus: 0,
      endpoint,
      envVar,
      location,
      parsing: 'Network error',
      error: err.message,
      recommendedFix: 'Verify network connection to integrate.api.nvidia.com',
    };
  }
}

export async function runFullAudit(): Promise<AuditReportItem[]> {
  return [
    await testOpenWeather(),
    await testCarto(),
    await testMapbox(),
    await testNasaFirms(),
    await testBhashini(),
    await testNvidiaNim(),
    await testHuggingFace(),
    await testCopernicus(),
    await testPostgreSql(),
    await testMarineDataSource(),
    await testAiAssistant(),
  ];
}

async function main() {
  console.log('=== REAL API INTEGRATION AUDIT EXECUTION ===\n');
  const results = await runFullAudit();
  for (const r of results) {
    console.log(`SERVICE: ${r.service}`);
    console.log(`STATUS: ${r.status} (HTTP ${r.httpStatus})`);
    console.log(`ENDPOINT: ${r.endpoint}`);
    console.log(`ENV VAR: ${r.envVar}`);
    console.log(`LOCATION: ${r.location}`);
    console.log(`PARSING: ${r.parsing}`);
    if (r.error) console.log(`ERROR: ${r.error}`);
    if (r.recommendedFix) console.log(`FIX: ${r.recommendedFix}`);
    console.log('--------------------------------------------------');
  }
}

if (process.argv[1]?.includes('audit_apis')) {
  main();
}
