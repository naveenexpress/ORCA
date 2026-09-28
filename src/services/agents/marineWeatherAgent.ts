import { LanguageCode } from '../../types';
import { LiveWeatherData } from './types';

const degToCompass = (num: number): string => {
  const val = Math.floor(num / 22.5 + 0.5);
  const arr = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  return arr[val % 16];
};

export class MarineWeatherAgent {
  private static cacheMap = new Map<string, { data: LiveWeatherData; time: number }>();
  private static CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

  /**
   * Fetch real-time weather from OpenWeather API or return cached with freshness indicators
   */
  public static async fetchMarineWeather(
    lat = 13.125,
    lon = 80.300,
    cityName = 'Kasimedu / Chennai Coast'
  ): Promise<LiveWeatherData | null> {
    const cacheKey = `${lat.toFixed(2)},${lon.toFixed(2)}`;
    const now = Date.now();
    const cached = this.cacheMap.get(cacheKey);

    if (cached && now - cached.time < this.CACHE_TTL_MS) {
      return cached.data;
    }


    // No client-side API key needed; request weather via backend proxy
    try {
      const API_BASE = 'http://localhost:3001/api';
      const res = await fetch(`${API_BASE}/weather?lat=${lat}&lon=${lon}&units=metric`);
      if (!res.ok) {
        throw new Error(`Weather service returned status ${res.status}`);
      }

      const data = await res.json();
      const speedKnots = +(data.wind.speed * 1.94384).toFixed(1);
      const speedKmh = +(data.wind.speed * 3.6).toFixed(1);
      const visKm = +(data.visibility / 1000).toFixed(1);
      const visNm = +(data.visibility / 1852).toFixed(1);
      const cardinal = degToCompass(data.wind.deg || 0);

      // Sea state formula
      let waveEst = '0.8 — 1.2 m (Slight Swell)';
      let status: 'SAFE TO VENTURE' | 'CAUTION ADVISED' | 'ROUGH SEA' = 'SAFE TO VENTURE';
      let statusColor = 'text-[#16845F] bg-[#EAF8F1] border-[#BFE7D1]';

      if (speedKnots >= 24 || data.main.pressure < 1000) {
        waveEst = '2.4 — 3.5 m (Rough Sea)';
        status = 'ROUGH SEA';
        statusColor = 'text-[#DC2626] bg-[#FEE2E2] border-[#FCA5A5]';
      } else if (speedKnots >= 15 || data.main.pressure < 1005) {
        waveEst = '1.3 — 1.8 m (Moderate Waves)';
        status = 'CAUTION ADVISED';
        statusColor = 'text-[#D97706] bg-[#FEF3C7] border-[#FCD34D]';
      }

      const liveReport: LiveWeatherData = {
        temp: Math.round(data.main.temp),
        feelsLike: Math.round(data.main.feels_like),
        humidity: data.main.humidity,
        pressure: data.main.pressure,
        windSpeedKnots: speedKnots,
        windSpeedKmh: speedKmh,
        windDeg: data.wind.deg || 0,
        windCardinal: cardinal,
        visibilityKm: visKm,
        visibilityNm: visNm,
        description: data.weather[0]?.description || 'Clear sky',
        icon: data.weather[0]?.icon || '01d',
        waveEstimate: waveEst,
        seaStatus: status,
        seaStatusColor: statusColor,
        city: cityName,
        lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isLiveData: true,
      };

      this.cacheMap.set(cacheKey, { data: liveReport, time: now });
      return liveReport;
    } catch (err) {
      console.warn('Live weather fetch failed, checking cached data...', err);
      if (cached) {
        return {
          ...cached.data,
          isLiveData: false,
        };
      }
      return null;
    }
  }

  /**
   * Format localized weather response in any of the 7 supported languages
   */
  public static formatWeatherResponse(data: LiveWeatherData | null, lang: LanguageCode): string {
    if (!data) {
      switch (lang) {
        case 'ta':
          return 'தற்போதைய கடல் நிலைத் தரவைப் பெற தேவையான இணைய அல்லது தரவு சேவை தற்போது கிடைக்கவில்லை. நேரடி தகவல் கிடைத்தவுடன் மீண்டும் முயற்சிக்கவும்.';
        case 'hi':
          return 'वर्तमान मौसम और समुद्री स्थिति डेटा प्राप्त करने के लिए सेवा उपलब्ध नहीं है। कृपया इंटरनेट कनेक्शन जांचें और पुनः प्रयास करें।';
        case 'te':
          return 'ప్రస్తుత సముద్ర వాతావరణ సమాచారాన్ని పొందడానికి లైవ్ సర్వర్ అందుబాటులో లేదు. దయచేసి ఇంటర్నెట్ తనిಖీ చేసి మళ్లీ ప్రయత్నించండి.';
        case 'ml':
          return 'തത്സമയ കാലാവസ്ഥാ വിവരങ്ങൾ ലഭ്യമാക്കാൻ കഴിഞ്ഞില്ല. ഇൻ്റർനെറ്റ് കണക്ഷൻ പരിശോധിച്ച് വീണ്ടും ശ്രമിക്കുക.';
        case 'kn':
          return 'ಪ್ರಸ್ತುತ ಸಾಗರ ಹವಾಮಾನ ಮಾಹಿತಿ ಪಡೆಯಲು ಲೈವ್ ಸರ್ವರ್ ಲಭ್ಯವಿಲ್ಲ. ಇಂಟರ್ನೆಟ್ ಸಂಪರ್ಕವನ್ನು ಪರಿಶೀಲಿಸಿ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.';
        case 'bn':
          return 'বর্তমান সামুদ্রিক আবহাওয়ার তথ্য এই মুহূর্তে উপলব্ধ নেই। ইন্টারনেট সংযোগ পরীক্ষা করে পুনরায় চেষ্টা করুন।';
        case 'en':
        default:
          return 'Live marine weather and ocean condition data is currently unavailable. Please verify connection and try again.';
      }
    }

    const {
      temp,
      windSpeedKnots,
      windCardinal,
      waveEstimate,
      seaStatus,
      city,
      lastUpdated,
      isLiveData,
    } = data;

    const dataPrefix = isLiveData ? '✓ Live OpenWeather' : '⚠️ Cached Data';

    switch (lang) {
      case 'ta':
        return `🌊 **${city} கடல் மற்றும் வானிலை அறிக்கை** (${dataPrefix} — ${lastUpdated}):\n• **கடல் நிலை**: ${seaStatus === 'SAFE TO VENTURE' ? 'கடலுக்கு செல்ல பாதுகாப்பானது ✅' : seaStatus === 'CAUTION ADVISED' ? 'எச்சரிக்கை தேவை ⚠️' : 'ஆபத்தான அலைகள் 🛑'}\n• **அலை உயரம்**: ${waveEstimate}\n• **காற்று வேகம்**: ${windSpeedKnots} knots (${windCardinal})\n• **வெப்பநிலை**: ${temp}°C\n• படகுகள் தகுந்த பாதுகாப்பு உபகரணங்களுடன் செல்லவும்.`;
      
      case 'hi':
        return `🌊 **${city} समुद्री और मौसम रिपोर्ट** (${dataPrefix} — ${lastUpdated}):\n• **समुद्री स्थिति**: ${seaStatus === 'SAFE TO VENTURE' ? 'समुद्र में जाना सुरक्षित है ✅' : seaStatus === 'CAUTION ADVISED' ? 'सावधानी बरतें ⚠️' : 'खतरनाक समुद्र 🛑'}\n• **लहरों की अनुमानित ऊंचाई**: ${waveEstimate}\n• **हवा की गति**: ${windSpeedKnots} नॉट (${windCardinal})\n• **तापमान**: ${temp}°C\n• कृपया सुरक्षा जैकेट और संचार उपकरण साथ रखें।`;

      case 'te':
        return `🌊 **${city} సముద్ర మరియు వాతావరణ నివేదిక** (${dataPrefix} — ${lastUpdated}):\n• **సముద్ర స్థితి**: ${seaStatus === 'SAFE TO VENTURE' ? 'సముద్రంలోకి వెళ్లడం సురక్షితం ✅' : seaStatus === 'CAUTION ADVISED' ? 'జాగ్రత్త అవసరం ⚠️' : 'ప్రమాదకరమైన అలలు 🛑'}\n• **అలల ఎత్తు**: ${waveEstimate}\n• **గాలి వేగం**: ${windSpeedKnots} నాట్స్ (${windCardinal})\n• **ఉష్ణోగ్రత**: ${temp}°C\n• బోట్లు అవసరమైన భద్రతా పరికరాలతో వెళ్ళవలెను.`;

      case 'ml':
        return `🌊 **${city} കടൽ കാലാവസ്ഥാ റിപ്പോർട്ട്** (${dataPrefix} — ${lastUpdated}):\n• **കടൽ നില**: ${seaStatus === 'SAFE TO VENTURE' ? 'കടലിൽ പോകാൻ സുരക്ഷിതമാണ് ✅' : seaStatus === 'CAUTION ADVISED' ? 'ജാഗ്രത പാലിക്കുക ⚠️' : 'പ്രക്ഷുബ്ധമായ കടൽ 🛑'}\n• **തിരമാല ഉയരം**: ${waveEstimate}\n• **കാറ്റിന്റെ വേഗത**: ${windSpeedKnots} നോട്ട്സ് (${windCardinal})\n• **താപനില**: ${temp}°C\n• ആവശ്യമായ സുരക്ഷാ സംവിധാനങ്ങൾ ഉറപ്പാക്കുക.`;

      case 'kn':
        return `🌊 **${city} ಸಾಗರ ಮತ್ತು ಹವಾಮಾನ ವರದಿ** (${dataPrefix} — ${lastUpdated}):\n• **ಸಾಗರ ಸ್ಥಿತಿ**: ${seaStatus === 'SAFE TO VENTURE' ? 'ಸಮುದ್ರಕ್ಕೆ ಹೋಗಲು ಸುರಕ್ಷಿತವಾಗಿದೆ ✅' : seaStatus === 'CAUTION ADVISED' ? 'ಎಚ್ಚರಿಕೆ ಅಗತ್ಯ ⚠️' : 'ಅಪಾಯಕಾರಿ ಅಲೆಗಳು 🛑'}\n• **ಅಲೆಗಳ ಎತ್ತರ**: ${waveEstimate}\n• **ಗಾಳಿಯ ವೇಗ**: ${windSpeedKnots} ನಾಟ್ಸ್ (${windCardinal})\n• **ತಾಪಮಾನ**: ${temp}°C\n• ದಯವಿಟ್ಟು ಲೈಫ್ ಜಾಕೆಟ್ ಮತ್ತು ಸಂವಹನ ಸಾಧನಗಳನ್ನು ತೆಗೆದುಕೊಂಡು ಹೋಗಿ.`;

      case 'bn':
        return `🌊 **${city} সমুদ্র ও আবহাওয়া রিপোর্ট** (${dataPrefix} — ${lastUpdated}):\n• **সমুদ্রের অবস্থা**: ${seaStatus === 'SAFE TO VENTURE' ? 'সমুদ্রে যাওয়া নিরাপদ ✅' : seaStatus === 'CAUTION ADVISED' ? 'সতর্কতা প্রয়োজন ⚠️' : 'উত্তাল সমুদ্র 🛑'}\n• **ঢেউয়ের উচ্চতা**: ${waveEstimate}\n• **বাতাসের গতি**: ${windSpeedKnots} নট (${windCardinal})\n• **তাপমাত্রা**: ${temp}°C\n• সমুদ্রে যাওয়ার আগে লাইফ জ্যাকেট সঙ্গে রাখুন।`;

      case 'en':
      default:
        return `🌊 **${city} Marine Weather & Sea State** (${dataPrefix} — ${lastUpdated}):\n• **Operational Status**: **${seaStatus}** ${seaStatus === 'SAFE TO VENTURE' ? '✅' : '⚠️'}\n• **Estimated Wave Swell**: ${waveEstimate}\n• **Surface Wind**: ${windSpeedKnots} knots (${windCardinal})\n• **Ambient Temperature**: ${temp}°C\n• Ensure VHF radio is on Channel 16 and lifejackets are secured.`;
    }
  }
}
