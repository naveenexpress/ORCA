import { LanguageCode, PfzAdvisory } from '../../types';
import { MarineWeatherAgent } from './marineWeatherAgent';
import { PfzAgent } from './pfzAgent';
import { NavigationAgent } from './navigationAgent';
import { SafetyAlertAgent } from './safetyAlertAgent';
import { AgentQueryResult, LiveWeatherData, MarineIntent } from './types';
import { usePfzStore } from '../../store/pfzStore';
import { LocationService, ResolvedLocation } from '../locationService';

export class MarineAgentOrchestrator {
  /**
   * Detect intent from multilingual input across all 7 Indian languages
   */
  public static detectIntent(query: string): MarineIntent {
    const q = query.toLowerCase().trim();

    // 1. Emergency / SOS
    const sosKeywords = [
      'sos', 'emergency', 'mayday', 'help', 'sinking', 'breakdown', 'distress',
      'அவசரம்', 'காப்பாற்று', 'ஆபத்து', 'உதவி',
      'मदद', 'संकट', 'आपातकाल', 'खतरा', 'डूब',
      'ఆపద', 'రక్షించండి', 'సహాయం', 'ముప్పు',
      'സഹായം', 'അപകടം', 'രക്ഷിക്കുക',
      'ಅಪಾಯ', 'ಸಹಾಯ', 'ಮುಳುಗುತ್ತಿದೆ',
      'বিপদ', 'সাহায্য', 'বাঁচাও'
    ];
    if (sosKeywords.some((k) => q.includes(k))) {
      return 'emergency_sos';
    }

    // 2. Weather / Waves / Wind / Safe to go / Tomorrow conditions
    const weatherKeywords = [
      'weather', 'sea', 'wave', 'wind', 'cyclone', 'storm', 'swell', 'safe', 'tomorrow', 'morning', 'condition',
      'வானிலை', 'அலை', 'காற்று', 'கடல்', 'பாதுகாப்பு', 'நாளை', 'போகலாமா', 'புயல்',
      'मौसम', 'हवा', 'लहर', 'लहरें', 'सुरक्षित', 'समुद्र', 'तूफान', 'कल',
      'వాతావరణం', 'అలలు', 'గాలి', 'సముద్రం', 'సురక్షితం', 'రేపు',
      'കാലാവസ്ഥ', 'തിരമാല', 'കാറ്റ്', 'കടൽ', 'നാളെ',
      'ಹವಾಮಾನ', 'ಗಾಳಿ', 'ಅಲೆ', 'ಸಮುದ್ರ', 'ಸುರಕ್ಷಿತ', 'ನಾಳೆ',
      'আবহাওয়া', 'ঢেউ', 'বাতাস', 'সমুদ্র', 'কাল', 'নিরাপদ'
    ];
    if (weatherKeywords.some((k) => q.includes(k))) {
      return 'weather_sea_state';
    }

    // 3. Navigation / Nearest Harbour / Distance & Bearing
    const navKeywords = [
      'nearest harbour', 'nearest harbor', 'nearest port', 'closest harbour', 'closest port',
      'harbour', 'harbor', 'port', 'landing centre', 'bearing', 'heading', 'distance', 'navigate', 'direction',
      'துறைமுகம்', 'திசை', 'தூரம்',
      'बंदरगाह', 'दिशा', 'दूरी',
      'హార్బర్', 'దిశ', 'దూరం',
      'ഹാർബർ', 'ദിശ', 'ദൂരം',
      'ಬಂದರು', 'ದಿಕ್ಕು', 'ದೂರ',
      'বন্দর', 'দিক', 'দূরত্ব'
    ];
    if (navKeywords.some((k) => q.includes(k)) && !q.includes('engine') && !q.includes('officer')) {
      return 'navigation_harbour';
    }

    // 4. PFZ / Fish Finding
    const pfzKeywords = [
      'pfz', 'fish', 'fishing', 'zone', 'tuna', 'mackerel', 'sardine', 'kasimedu', 'chennai', 'vizag', 'cochin', 'bearing',
      'மீன்பிடி', 'மீன்', 'மண்டலம்', 'சூரை',
      'मछली', 'मत्स्य', 'क्षेत्र', 'ट्यूना',
      'చేపలు', 'మత్స్య', 'క్షేత్రం',
      'മത്സ്യം', 'മേഖല',
      'ಮೀನು', 'ಮೀನುಗಾರಿಕೆ', 'ವಲಯ',
      'মাছ', 'অঞ্চল', 'ইলিশ'
    ];
    if (pfzKeywords.some((k) => q.includes(k))) {
      return 'pfz_fishing_zone';
    }

    // 5. SST / Chlorophyll / Ocean Science
    const scienceKeywords = [
      'sst', 'chlorophyll', 'temperature', 'satellite', 'plankton', 'science',
      'வெப்பநிலை', 'குளோரோபில்', 'உಷ್ಣோగ్రత', 'ತಾಪಮಾನ', 'তাপমাত্রা'
    ];
    if (scienceKeywords.some((k) => q.includes(k))) {
      return 'oceanographic_science';
    }

    // 6. Service / Cases / Harbour
    const serviceKeywords = [
      'service', 'request', 'engine', 'officer', 'claim', 'subsidy',
      'சேவை', 'கோரிக்கை', 'सेवा', 'ವಿನಂತಿ', 'സേവനം'
    ];
    if (serviceKeywords.some((k) => q.includes(k))) {
      return 'service_harbour_case';
    }

    return 'general_guidance';
  }

  /**
   * Execute multi-agent data pipeline and produce a localized verified response
   */
  public static async processMarineQuery(
    query: string,
    language: LanguageCode = 'en',
    activeAdvisories?: PfzAdvisory[]
  ): Promise<AgentQueryResult> {
    const intent = this.detectIntent(query);

    if (!activeAdvisories) {
      const { selectedLandingCentre, advisories } = usePfzStore.getState();
      activeAdvisories =
        selectedLandingCentre === 'ALL'
          ? advisories
          : advisories.filter((a) => a.landingCentreName === selectedLandingCentre);

      if (activeAdvisories.length === 0) activeAdvisories = advisories;
    }

    // Step 1: Resolve user requested location
    const resolvedLoc = LocationService.resolveLocation(query, activeAdvisories);

    // Step 2: Fetch specialized agent ground-truth telemetry
    let weatherData: LiveWeatherData | null = null;
    try {
      weatherData = await MarineWeatherAgent.fetchMarineWeather(
        resolvedLoc.lat,
        resolvedLoc.lng,
        resolvedLoc.name
      );
    } catch {
      weatherData = null;
    }

    // PFZ Agent: find matching or nearest advisory
    let targetAdvisory: PfzAdvisory | null = null;
    if (resolvedLoc.matchedAdvisory) {
      targetAdvisory = resolvedLoc.matchedAdvisory;
    } else {
      targetAdvisory = PfzAgent.getMatchingAdvisory(query, activeAdvisories);
    }

    // Navigation Agent: find nearest harbour and bearings
    const nearestHarbour = NavigationAgent.findNearestHarbour({
      lat: resolvedLoc.lat,
      lng: resolvedLoc.lng,
    });

    // Step 3: Attempt real LLM reasoning via secure backend AI endpoint
    try {
      const groundTruth = {
        location: {
          name: resolvedLoc.name,
          lat: resolvedLoc.lat,
          lng: resolvedLoc.lng,
          source: resolvedLoc.source,
        },
        weather: weatherData
          ? {
              ...weatherData,
              isAvailable: weatherData.isLiveData,
            }
          : { isAvailable: false },
        pfz: targetAdvisory
          ? {
              advisoryId: targetAdvisory.advisoryId,
              name: targetAdvisory.name,
              landingCentreName: targetAdvisory.landingCentreName,
              state: targetAdvisory.state,
              district: targetAdvisory.district,
              distanceKm: targetAdvisory.distanceKm,
              distanceNm: targetAdvisory.distanceFromLandingCentre,
              directionFromLandingCentre: targetAdvisory.directionFromLandingCentre,
              bearingDegrees: targetAdvisory.bearingDegrees,
              depth: targetAdvisory.depth,
              seaSurfaceTemperature: targetAdvisory.seaSurfaceTemperature,
              chlorophyll: targetAdvisory.chlorophyll,
              confidence: targetAdvisory.confidence,
              targetSpecies: targetAdvisory.targetSpecies,
              publishedAt: targetAdvisory.publishedAt || targetAdvisory.lastUpdatedAt,
              isAvailable: true,
            }
          : { isAvailable: false },
        navigation: {
          nearestHarbourName: nearestHarbour.harbourName,
          distanceKm: nearestHarbour.distanceKm,
          distanceNm: nearestHarbour.distanceNm,
          bearingDegrees: nearestHarbour.bearingDegrees,
          cardinal: nearestHarbour.cardinal,
          coordinates: nearestHarbour.coordinates,
          isAvailable: true,
        },
        safety: {
          hotline: '1554',
          marinePolice: '1093',
          sarVHF: 'Channel 16 (156.800 MHz)',
          emergencySteps: [
            'Trigger red Emergency SOS button',
            'Contact Indian Coast Guard on 1554',
            'Broadcast Mayday on VHF Channel 16',
            'Alert Coastal Police on 1093',
          ],
        },
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const API_BASE = 'http://localhost:3001/api';
      const res = await fetch(`${API_BASE}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          language,
          intent,
          location: groundTruth.location,
          groundTruth,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const aiData = await res.json();
        if (aiData.text && aiData.text.trim()) {
          return {
            text: aiData.text.trim(),
            isVerifiedData: aiData.isVerifiedData ?? (weatherData?.isLiveData || targetAdvisory !== null),
            sourceCitation: aiData.sourceCitation || 'ORCA Maritime Reasoning Engine & NVIDIA NIM',
            dataTimestamp: aiData.dataTimestamp || weatherData?.lastUpdated || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            intent,
            quickActions: this.getQuickActionsForIntent(intent, resolvedLoc, targetAdvisory),
            cardPreview: this.getCardPreviewForIntent(intent, weatherData, targetAdvisory),
          };
        }
      }
    } catch {
      // Backend unreachable or timed out — fall through to local deterministic agents
    }

    // Step 4: Deterministic fallback using local specialized agents
    return this.fallbackLocalAgentResponse(
      query,
      language,
      intent,
      resolvedLoc,
      activeAdvisories,
      weatherData,
      targetAdvisory,
      nearestHarbour
    );
  }

  private static getQuickActionsForIntent(
    intent: MarineIntent,
    resolvedLoc: ResolvedLocation,
    targetAdvisory: PfzAdvisory | null
  ) {
    if (intent === 'emergency_sos') {
      return [
        { label: '🚨 Launch SOS Emergency Dispatch', action: 'TRIGGER_SOS' },
        { label: '📞 Dial Coast Guard 1554', action: 'DIAL_HOTLINE' },
      ];
    }
    if (intent === 'weather_sea_state') {
      return [
        { label: '🌊 View Live Ocean Report', action: 'NAVIGATE_LIVE_REPORT' },
        { label: '🗺️ Show Marine GIS Map', action: 'NAVIGATE_MAP' },
      ];
    }
    if (intent === 'navigation_harbour') {
      return [
        { label: '🗺️ View on Marine Map', action: 'NAVIGATE_MAP' },
        { label: '🧭 Calculate GPS Bearing', action: 'CALC_BEARING' },
      ];
    }
    if (intent === 'pfz_fishing_zone' && targetAdvisory) {
      return [
        { label: '🗺️ Show on Marine Map', action: 'NAVIGATE_MAP', payload: { pfzId: targetAdvisory.id } },
        { label: '🧭 Calculate GPS Bearing', action: 'CALC_BEARING', payload: { targetAdvisory } },
        { label: '👨‍✈️ Contact Field Agent', action: 'HANDOFF_AGENT' },
      ];
    }
    return [
      { label: '🌊 Check Sea State & Wind', action: 'QUERY_WEATHER' },
      { label: "🐟 Today's Active PFZs", action: 'QUERY_PFZ', payload: '' },
      { label: '🚨 Emergency Assistance Info', action: 'QUERY_SOS' },
    ];
  }

  private static getCardPreviewForIntent(
    intent: MarineIntent,
    weatherData: LiveWeatherData | null,
    targetAdvisory: PfzAdvisory | null
  ) {
    if (intent === 'emergency_sos') {
      return {
        type: 'sos' as const,
        data: {
          hotline: '1554',
          marinePolice: '1093',
          sarVHF: 'Channel 16 (156.800 MHz)',
        },
      };
    }
    if (intent === 'weather_sea_state' && weatherData) {
      return {
        type: 'weather' as const,
        data: weatherData,
      };
    }
    if (intent === 'pfz_fishing_zone' && targetAdvisory) {
      return {
        type: 'pfz' as const,
        data: targetAdvisory,
      };
    }
    return undefined;
  }

  private static fallbackLocalAgentResponse(
    query: string,
    language: LanguageCode,
    intent: MarineIntent,
    resolvedLoc: ResolvedLocation,
    activeAdvisories: PfzAdvisory[],
    weatherData: LiveWeatherData | null,
    targetAdvisory: PfzAdvisory | null,
    nearestHarbour: ReturnType<typeof NavigationAgent.findNearestHarbour>
  ): AgentQueryResult {
    // 1. Emergency SOS
    if (intent === 'emergency_sos') {
      const text = SafetyAlertAgent.formatEmergencyResponse(language);
      return {
        text,
        isVerifiedData: true,
        sourceCitation: 'Indian Coast Guard SAR Protocol / INCOIS Disaster Command',
        intent,
        quickActions: [
          { label: '🚨 Launch SOS Emergency Dispatch', action: 'TRIGGER_SOS' },
          { label: '📞 Dial Coast Guard 1554', action: 'DIAL_HOTLINE' },
        ],
        cardPreview: {
          type: 'sos',
          data: {
            hotline: '1554',
            marinePolice: '1093',
            sarVHF: 'Channel 16 (156.800 MHz)',
          },
        },
      };
    }

    // 2. Weather & Sea Conditions
    if (intent === 'weather_sea_state') {
      const text = MarineWeatherAgent.formatWeatherResponse(weatherData, language);
      return {
        text,
        isVerifiedData: weatherData !== null && weatherData.isLiveData,
        sourceCitation: weatherData?.isLiveData
          ? 'Live OpenWeather API & Oceanographic Wave Estimator'
          : 'Cached Marine Weather Advisory',
        dataTimestamp: weatherData?.lastUpdated,
        intent,
        quickActions: [
          { label: '🌊 View Live Ocean Report', action: 'NAVIGATE_LIVE_REPORT' },
          { label: '🗺️ Show Marine GIS Map', action: 'NAVIGATE_MAP' },
        ],
        cardPreview: weatherData ? { type: 'weather', data: weatherData } : undefined,
      };
    }

    // 3. Navigation / Nearest Harbour
    if (intent === 'navigation_harbour') {
      const text = NavigationAgent.formatNearestHarbourResponse(nearestHarbour, language);
      return {
        text,
        isVerifiedData: true,
        sourceCitation: 'ORCA Maritime Navigation & Coastal Registry',
        intent,
        quickActions: [
          { label: '🗺️ View on Marine Map', action: 'NAVIGATE_MAP' },
          { label: '🧭 Calculate GPS Bearing', action: 'CALC_BEARING' },
        ],
      };
    }

    // 4. PFZ Fishing Zones
    if (intent === 'pfz_fishing_zone') {
      if (resolvedLoc.isExplicitMatch && targetAdvisory) {
        const text = PfzAgent.formatPfzResponse(targetAdvisory, language);
        return {
          text,
          isVerifiedData: true,
          sourceCitation: `${targetAdvisory.source} (Advisory #${targetAdvisory.advisoryId})`,
          dataTimestamp: new Date(targetAdvisory.publishedAt || targetAdvisory.lastUpdatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          intent,
          quickActions: [
            { label: '🗺️ Show on Marine Map', action: 'NAVIGATE_MAP', payload: { pfzId: targetAdvisory.id } },
            { label: '🧭 Calculate GPS Bearing', action: 'CALC_BEARING', payload: { targetAdvisory } },
            { label: '👨‍✈️ Contact Field Agent', action: 'HANDOFF_AGENT' },
          ],
          cardPreview: {
            type: 'pfz',
            data: targetAdvisory,
          },
        };
      } else {
        const text = PfzAgent.formatAllPfzResponse(activeAdvisories, language);
        return {
          text,
          isVerifiedData: true,
          sourceCitation: 'INCOIS (Indian National Centre for Ocean Information Services)',
          intent,
          quickActions: activeAdvisories.slice(0, 3).map((a) => ({
            label: `🐟 ${a.landingCentreName}`,
            action: 'QUERY_PFZ',
            payload: a.landingCentreName,
          })),
        };
      }
    }

    // 5. Oceanographic Science
    if (intent === 'oceanographic_science') {
      const textMap: Record<LanguageCode, string> = {
        ta: '🔬 **PFZ கடல்சார் முகப்புகள் எவ்வாறு உருவாகின்றன**:\n1. **கடல் மேற்பரப்பு வெப்பநிலை (SST)**: செயற்கைக்கோள்கள் குளிர்ச்சியான ஊட்டச்சத்து நிறைந்த நீரும், சூடான மேற்பரப்பு நீரும் சந்திக்கும் வெப்ப சாய்வுகளைக் கண்டறிகின்றன.\n2. **குளோரோபில்-ஏ**: தாவர மிதவை நுண்ணுயிர்கள் அதிகமுள்ள பகுதிகளை ஓஷன் கலர் சென்சார்கள் கண்டறிகின்றன.\n3. **மீன்கள் சேகரிப்பு**: இவை சூரை (Tuna), கானாங்கெளுத்தி போன்ற பெரிய மீன்களை ஈர்க்கின்றன.',
        hi: '🔬 **पीएफजेड समुद्री मोर्चों का विज्ञान**:\n1. **समुद्री सतह तापमान (SST)**: उपग्रह थर्मल ग्रेडिएंट्स का पता लगाते हैं जहाँ ठंडा पोषक तत्वों से भरपूर पानी गर्म पानी से मिलता है।\n2. **क्लोरोफिल सांद्रता**: महासागर रंग सेंसर फाइटोप्लांकटन की पहचान करते हैं।\n3. **मछली एकत्रीकरण**: फाइटोप्लांकटन चारा मछलियों को आकर्षित करता है, जिससे टूना, मैकेरल जैसी बड़ी मछलियाँ एकत्र होती हैं।',
        te: '🔬 **PFZ సముద్ర ప్రాంతాలు ఎలా పనిచేస్తాయి**:\n1. **సముద్ర ఉపరితల ఉష్ణోగ్రత (SST)**: ఉపగ్రహాలు చల్లని పోషకాలు కలిగిన నీరు మరియు వెచ్చని నీరు కలిసే ప్రాంతాలను గుర్తిస్తాయి.\n2. **క్లోరోఫిల్-ఎ**: ఫైటోప్లాంక్టన్ పుష్కలంగా ఉన్న ప్రాంతాలను సెన్సార్లు గుర్తిస్తాయి.\n3. **చేపల సంచారం**: ఇది ట్యూనా, వంజరం వంటి పెద్ద చేపలను ఆకర్షిస్తుంది.',
        ml: '🔬 **PFZ സമുദ്ര മേഖലകളുടെ ശാസ്ത്രം**:\n1. **സമുദ്രോപരിതല താപനില (SST)**: തണുത്ത പോഷക സമ്പുഷ്ടമായ വെള്ളവും ഉപരിതല ജലവും ചേരുന്ന മേഖലകൾ ഉപഗ്രഹം കണ്ടെത്തുന്നു.\n2. **ക്ലോറോഫിൽ സാന്ദ്രത**: ഫൈറ്റോപ്ലാങ്ക്ടൺ കൂടുതലുള്ള പ്രദേശങ്ങൾ തിരിച്ചറിയുന്നു.\n3. **മത്സ്യങ്ങളുടെ സാന്നിധ്യം**: ഇത് ട്യൂണ, അയില തുടങ്ങിയ വലിയ മത്സ്യക്കൂട്ടങ്ങളെ ആകർഷിക്കുന്നു.',
        kn: '🔬 **PFZ ಸಾಗರ ಮುಂಭಾಗಗಳ ವಿಜ್ಞಾನ**:\n1. **ಸಮುದ್ರದ ಮೇಲ್ಮೈ ತಾಪಮಾನ (SST)**: ತಂಪಾದ ಪೌಷ್ಟಿಕಾಂಶ ಭರಿತ ನೀರು ಮತ್ತು ಬೆಚ್ಚಗಿನ ಮೇಲ್ಮೈ ನೀರು ಸಂಧಿಸುವ ಉಷ್ಣ ಗ್ರೇಡಿಯಂಟ್‌ಗಳನ್ನು ಉಪಗ್ರಹಗಳು ಪತ್ತೆಹಚ್ಚುತ್ತವೆ.\n2. **ಕ್ಲೋರೊಫಿಲ್ ಸಾಂದ್ರತೆ**: ಫೈಟೊಪ್ಲಾಂಕ್ಟನ್ ಇರುವಿಕೆಯನ್ನು ಸಾಗರ ಬಣ್ಣ ಸಂವೇದಕಗಳು ಪತ್ತೆಹಚ್ಚುತ್ತವೆ.\n3. **ಮೀನುಗಳ ಒಟ್ಟುಗೂಡುವಿಕೆ**: ಇದು ಟ್ಯೂನಾ, ಬಂಗಡೆ ಮುಂತಾದ ದೊಡ್ಡ ಮೀನುಗಳನ್ನು ಆಕರ್ಷಿಸುತ್ತದೆ.',
        bn: '🔬 **PFZ সমুদ্র অঞ্চলের বৈজ্ঞানিক ভিত্তি**:\n1. **সমুদ্র পৃষ্ঠের তাপমাত্রা (SST)**: উপগ্রহ তাপমাত্রার পরিবর্তন পর্যবেক্ষণ করে যেখানে পুষ্টিসমৃদ্ধ ঠান্ডা জল গরম জলের সাথে মিলিত হয়।\n2. **ক্লোরোফিল ঘনত্ব**: ওশান কালার সেন্সর ফাইটোপ্ল্যাঙ্কটন চিহ্নিত করে।\n3. **মাছের উপস্থিতি**: ফাইটোপ্ল্যাঙ্কটন টুনা, ম্যাকেরেলের মতো শিকারী মাছের ঝাঁককে আকর্ষণ করে।',
        en: '🔬 **Science of Potential Fishing Zones (PFZ)**:\n1. **Sea Surface Temperature (SST)**: Satellite radiometers detect thermal gradients where cold nutrient-rich upwelling waters meet warm surface waters.\n2. **Chlorophyll-a Concentrations**: Ocean color sensors identify phytoplankton blooms.\n3. **Fish Aggregation**: Plankton attracts baitfish, aggregating commercial pelagic schools such as Tuna, Mackerel, and Seer fish.',
      };

      return {
        text: textMap[language] || textMap.en,
        isVerifiedData: true,
        sourceCitation: 'INCOIS Marine Oceanography & Remote Sensing Division',
        intent,
        quickActions: [
          { label: '🔬 Open Research Dashboard', action: 'NAVIGATE_RESEARCH' },
          { label: '📈 View SST vs Chlorophyll Graphs', action: 'SHOW_CHARTS' },
        ],
      };
    }

    // 6. Service / Cases
    if (intent === 'service_harbour_case') {
      const textMap: Record<LanguageCode, string> = {
        ta: '📋 படகு இயந்திரக் கோளாறு, துறைமுக அனுமதி, வானிலை விளக்கம் அல்லது உபகரண உதவிக்கான அதிகாரப்பூர்வ சேவை கோரிக்கையை நீங்கள் சமர்ப்பிக்கலாம். அருகிலுள்ள களப்பணியாளர் உடனடியாக ஒதுக்கப்படுவார்.',
        hi: '📋 आप नाव के इंजन की खराबी, बंदरगाह निकासी, या गियर मरम्मत के लिए सेवा अनुरोध दर्ज कर सकते हैं। निकटतम फील्ड एजेंट तुरंत सहायता करेंगे।',
        te: '📋 మీరు పడవ ఇంజిన్ మరమ్మత్తు, హార్బర్ క్లియరెన్స్ లేదా సహాయం కోసం సేవా అభ్యర్థనను సమర్పించవచ్చు. సమీపంలోని ఫీల్డ్ ఆఫీసర్ వెంటనే స్పందిస్తారు.',
        ml: '📋 ബോട്ട് എഞ്ചിൻ തകരാർ, ഹാർബർ ക്ലിയറൻസ് എന്നിവയ്ക്കായി നിങ്ങൾക്ക് സർവീസ് അഭ്യർത്ഥന സമർപ്പിക്കാം. ഫീൽഡ് ഏജൻ്റ് ഉടൻ സഹായിക്കും.',
        kn: '📋 ದೋಣಿ ಎಂಜಿನ್ ದುರಸ್ತಿ, ಬಂದರು ಅನುಮತಿ ಅಥವಾ ಸಾಧನಗಳ ಸಹಾಯಕ್ಕಾಗಿ ನೀವು ಸೇವಾ ವಿನಂತಿಯನ್ನು ಸಲ್ಲಿಸಬಹುದು. ಸಮೀಪದ ಕ್ಷೇತ್ರ ಅಧಿಕಾರಿ ತಕ್ಷಣ ಸಹಾಯ ಮಾಡುತ್ತಾರೆ.',
        bn: '📋 আপনি নৌকার ইঞ্জিন মেরামত, বন্দর ছাড়পত্র বা সহায়তার জন্য একটি পরিষেবা অনুরোধ জমা দিতে পারেন। মাঠ পর্যায়ের কর্মকর্তা অবিলম্বে যোগাযোগ করবেন।',
        en: '📋 You can create an official service request for Harbour Clearance, Engine Breakdown Support, Weather Briefings, or Fishing Gear claims. Our multi-agent engine will automatically dispatch the nearest field officer.',
      };

      return {
        text: textMap[language] || textMap.en,
        isVerifiedData: true,
        sourceCitation: 'ORCA Automated Multi-Agent Service Framework',
        intent,
        quickActions: [
          { label: '📝 Create New Service Request', action: 'CREATE_CASE' },
          { label: '👤 View Field Extension Agents', action: 'VIEW_AGENTS' },
        ],
      };
    }

    // 7. General Guidance
    const welcomeMap: Record<LanguageCode, string> = {
      ta: 'வணக்கம்! நான் உங்கள் ஆர்கா கடல்சார் உதவியாளர்.\n• இன்றைய சிறந்த மீன்பிடி மண்டலங்கள் (PFZ)\n• கடல் நிலை மற்றும் காற்றின் வேகம்\n• திசை மற்றும் காம்பஸ் வழிகாட்டல்\n• அவசர உதவி (SOS) மற்றும் பாதுகாப்பு எச்சரிக்கைகள்\nகுறித்து என்னிடம் கேளுங்கள்.',
      hi: 'नमस्ते! मैं आपका ओरका समुद्री सहायक हूँ।\n• आज के प्रमुख मछली पकड़ने के क्षेत्र (PFZ)\n• समुद्र की स्थिति और हवा की गति\n• दिशा और कम्पास मार्गदर्शन\n• आपातकालीन सहायता (SOS) और सुरक्षा प्रोटोकॉल\nके बारे में मुझसे पूछें।',
      te: 'నమస్కారం! నేను మీ ఆర్కా సముద్ర సహాయకుడిని.\n• నేటి ఉత్తమ మత్స్య క్షేత్రాలు (PFZ)\n• సముద్ర స్థితి మరియు గాలి వేగం\n• దిశ మరియు దిక్సూచి మార్గదర్శనం\n• అత్యవసర సహాయం (SOS) మరియు భద్రత\nగురించి నన్ను అడగండి.',
      ml: 'നമസ്കാരം! ഞാൻ നിങ്ങളുടെ ഓർക്ക സമുദ്ര സഹായിയാണ്.\n• ഇന്നത്തെ മികച്ച മത്സ്യബന്ധന മേഖലകൾ (PFZ)\n• കടൽ നിലയും കാറ്റിന്റെ വേഗതയും\n• കോമ്പസ് ദിശയും മാർഗ്ഗനിർദ്ദേശവും\n• അടിയന്തര സഹായം (SOS)\nഎന്നിവയെക്കുറിച്ച് ചോദിക്കാം.',
      kn: 'ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ ಆರ್ಕಾ ಸಮುದ್ರ ಸಹಾಯಕ.\n• ಇಂದಿನ ಪ್ರಮುಖ ಮೀನುಗಾರಿಕೆ ವಲಯಗಳು (PFZ)\n• ಸಾಗರ ಸ್ಥಿತಿ ಮತ್ತು ಗಾಳಿಯ ವೇಗ\n• ದಿಕ್ಸೂಚಿ ಬೇರಿಂಗ್ ಮತ್ತು ಸಂಚರಣೆ\n• ತುರ್ತು ಸಹಾಯ (SOS) ಮತ್ತು ಸುರಕ್ಷತಾ ಎಚ್ಚರಿಕೆಗಳು\nಕುರಿತು ನನ್ನನ್ನು ಕೇಳಬಹುದು.',
      bn: 'নমস্কার! আমি আপনার অর্কা সামুদ্রিক সহায়ক।\n• আজকের সেরা সম্ভাব্য মৎস্য অঞ্চল (PFZ)\n• সমুদ্রের অবস্থা ও বাতাসের গতি\n• কম্পাস দিকনির্দেশনা\n• জরুরি সহায়তা (SOS) ও সুরক্ষা বার্তা\nসম্পর্কে আমাকে জিজ্ঞাসা করুন।',
      en: "Welcome to ORCA Maritime Intelligence Assistant. You can ask me about:\n• Today's Potential Fishing Zones (PFZ) and target species\n• Real-time marine weather, swell, and wind safety\n• Navigation compass bearings, distances, and depths\n• Maritime SOS emergency protocols and Coast Guard contacts\n• Connecting with local coastal field agents",
    };

    return {
      text: welcomeMap[language] || welcomeMap.en,
      isVerifiedData: true,
      sourceCitation: 'ORCA Maritime Reasoning Engine',
      intent: 'general_guidance',
      quickActions: [
        { label: '🌊 Check Sea State & Wind', action: 'QUERY_WEATHER' },
        { label: "🐟 Today's Active PFZs", action: 'QUERY_PFZ', payload: '' },
        { label: '🚨 Emergency Assistance Info', action: 'QUERY_SOS' },
      ],
    };
  }
}
