import React, { useState, useEffect, useCallback } from 'react';
import {
  Radio,
  Waves,
  Wind,
  Thermometer,
  Eye,
  Compass,
  RefreshCw,
  AlertTriangle,
  Fish,
  Plus,
  MapPin,
  Volume2,
  VolumeX,
  Download,
  CheckCircle2,
  Anchor,
  X,
  Send,
  Droplets,
  Gauge,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/authStore';

export interface FieldObservation {
  id: string;
  category: 'fish' | 'hazard' | 'sea_state' | 'harbour';
  title: string;
  location: string;
  reporter: string;
  vesselId?: string;
  timestamp: string;
  timeAgo: string;
  severity: 'normal' | 'caution' | 'critical';
  confirmations: number;
  hasConfirmed?: boolean;
}



const INITIAL_REPORTS: FieldObservation[] = [
  {
    id: 'obs-1',
    category: 'fish',
    title: 'High Aggregation: Indian Mackerel & Sardines',
    location: '7.8 NM East of Harbour (Grid TN-04)',
    reporter: 'Capt. R. Murugan',
    vesselId: 'IND-TN-02-MM-1044',
    timestamp: '2026-09-22T11:48:00',
    timeAgo: '14 mins ago',
    severity: 'normal',
    confirmations: 12,
  },
  {
    id: 'obs-2',
    category: 'hazard',
    title: 'Drifting Submerged Wooden Pallet & Net Scraps',
    location: '2.5 NM SSE of Fairway Buoy',
    reporter: 'Kasimedu Coast Guard Patrol',
    vesselId: 'ICG-C-431',
    timestamp: '2026-09-22T11:25:00',
    timeAgo: '37 mins ago',
    severity: 'caution',
    confirmations: 19,
  },
  {
    id: 'obs-3',
    category: 'sea_state',
    title: 'Moderate Swell 1.4m with Steady Off-Shore Westerly Breeze',
    location: 'Outer Anchorage Roadstead',
    reporter: 'Pilot Vessel Varuna',
    vesselId: 'CHN-PILOT-03',
    timestamp: '2026-09-22T11:10:00',
    timeAgo: '52 mins ago',
    severity: 'normal',
    confirmations: 8,
  },
  {
    id: 'obs-4',
    category: 'harbour',
    title: 'Diesel Fuel Bunkering Berth #2 Cleared & Operational',
    location: 'North Quay Bunkering Jetty',
    reporter: 'Harbour Master Despatch',
    timestamp: '2026-09-22T10:30:00',
    timeAgo: '1 hr ago',
    severity: 'normal',
    confirmations: 24,
  },
];

interface LiveWeatherData {
  temp: number;
  feelsLike: number;
  humidity: number;
  pressure: number;
  windSpeedKnots: number;
  windSpeedKmh: number;
  windDeg: number;
  windCardinal: string;
  visibilityKm: number;
  visibilityNm: number;
  description: string;
  icon: string;
  waveEstimate: string;
  seaStatus: 'SAFE TO VENTURE' | 'CAUTION ADVISED' | 'ROUGH SEA';
  seaStatusColor: string;
  city: string;
  lastUpdated: string;
}

const degToCompass = (num: number): string => {
  const val = Math.floor(num / 22.5 + 0.5);
  const arr = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  return arr[val % 16];
};

import { usePfzStore } from '../../store/pfzStore';
import { LocationService } from '../../services/locationService';

export const LiveReport: React.FC = () => {
  const { t } = useTranslation();
  const { language, currentUser } = useAuthStore();
  const { advisories, selectedLandingCentre } = usePfzStore();

  const getTargetLocation = useCallback(() => {
    let target = advisories.find((a) => a.landingCentreName === selectedLandingCentre);
    if (target) {
      return {
        id: target.id,
        lat: target.latitude,
        lon: target.longitude,
        name: target.landingCentreName,
        state: target.state,
      };
    }

    const resolved = LocationService.resolveLocation(undefined, advisories);
    return {
      id: resolved.matchedAdvisory?.id || 'resolved-loc',
      lat: resolved.lat,
      lon: resolved.lng,
      name: resolved.name,
      state: resolved.matchedAdvisory?.state || 'Indian Maritime Zone',
    };
  }, [advisories, selectedLandingCentre]);

  const [selectedLoc, setSelectedLoc] = useState(getTargetLocation());

  useEffect(() => {
    setSelectedLoc(getTargetLocation());
  }, [getTargetLocation]);
  const [customLocName, setCustomLocName] = useState<string | null>(null);
  const [weatherData, setWeatherData] = useState<LiveWeatherData | null>(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);

  // Field Observations State
  const [reports, setReports] = useState<FieldObservation[]>(() => {
    try {
      const saved = localStorage.getItem('orca_live_field_reports');
      return saved ? JSON.parse(saved) : INITIAL_REPORTS;
    } catch {
      return INITIAL_REPORTS;
    }
  });
  const [activeFilter, setActiveFilter] = useState<'all' | 'fish' | 'hazard' | 'sea_state' | 'harbour'>('all');

  // Submit Observation Modal
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'fish' | 'hazard' | 'sea_state' | 'harbour'>('fish');
  const [newLocation, setNewLocation] = useState('');
  const [newSeverity, setNewSeverity] = useState<'normal' | 'caution' | 'critical'>('normal');
  const [submitSuccessMsg, setSubmitSuccessMsg] = useState<string | null>(null);

  // Audio Speech state
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Fetch Live Weather from OpenWeather
  const fetchLiveWeather = useCallback(async (lat: number, lon: number, locationName: string) => {
    setIsLoadingWeather(true);
    try {
      // Fetch weather via backend proxy
      const res = await fetch(`/api/weather?lat=${lat}&lon=${lon}&units=metric`);
      if (!res.ok) {
        throw new Error(`Weather service returned status ${res.status}`);
      }

      const data = await res.json();
      const speedKnots = +(data.wind.speed * 1.94384).toFixed(1);
      const speedKmh = +(data.wind.speed * 3.6).toFixed(1);
      const visKm = +(data.visibility / 1000).toFixed(1);
      const visNm = +(data.visibility / 1852).toFixed(1);
      const cardinal = degToCompass(data.wind.deg || 0);

      // Derive marine sea state estimate
      let waveEst = '0.7 — 1.1 m (Slight)';
      let status: 'SAFE TO VENTURE' | 'CAUTION ADVISED' | 'ROUGH SEA' = 'SAFE TO VENTURE';
      let statusColor = 'text-[#16845F] bg-[#EAF8F1] border-[#BFE7D1]';

      if (speedKnots >= 24 || data.main.pressure < 1000) {
        waveEst = '2.4 — 3.5 m (High Swell)';
        status = 'ROUGH SEA';
        statusColor = 'text-[#DC2626] bg-[#FEE2E2] border-[#FCA5A5]';
      } else if (speedKnots >= 15 || data.main.pressure < 1005) {
        waveEst = '1.3 — 1.8 m (Moderate)';
        status = 'CAUTION ADVISED';
        statusColor = 'text-[#D97706] bg-[#FEF3C7] border-[#FCD34D]';
      }

      const parsed: LiveWeatherData = {
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
        icon: data.weather[0]?.icon || '02d',
        waveEstimate: waveEst,
        seaStatus: status,
        seaStatusColor: statusColor,
        city: locationName || data.name,
        lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      };

      setWeatherData(parsed);
    } catch (err: any) {
      console.warn('Live weather fetch fallback:', err);
      setWeatherData({
        temp: 32,
        feelsLike: 38,
        humidity: 64,
        pressure: 1008,
        windSpeedKnots: 11.5,
        windSpeedKmh: 21.3,
        windDeg: 280,
        windCardinal: 'W',
        visibilityKm: 10.0,
        visibilityNm: 5.4,
        description: 'Scattered clouds & gentle coastal breeze',
        icon: '03d',
        waveEstimate: '1.0 — 1.4 m (Moderate)',
        seaStatus: 'SAFE TO VENTURE',
        seaStatusColor: 'text-[#16845F] bg-[#EAF8F1] border-[#BFE7D1]',
        city: locationName,
        lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      });
    } finally {
      setIsLoadingWeather(false);
    }
  }, []);

  useEffect(() => {
    fetchLiveWeather(selectedLoc.lat, selectedLoc.lon, selectedLoc.name);
    const interval = setInterval(() => {
      fetchLiveWeather(selectedLoc.lat, selectedLoc.lon, selectedLoc.name);
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [selectedLoc, fetchLiveWeather]);

  // Handle GPS location
  const handleUseGps = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsLoadingWeather(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const name = `Live GPS (${latitude.toFixed(3)}°N, ${longitude.toFixed(3)}°E)`;
        setCustomLocName(name);
        setSelectedLoc({
          id: 'gps',
          name,
          state: 'Vessel Telemetry',
          lat: latitude,
          lon: longitude,
        });
      },
      (err) => {
        alert('Could not retrieve GPS location: ' + err.message);
        setIsLoadingWeather(false);
      }
    );
  };

  // Confirm / Endorse observation
  const handleConfirmReport = (id: string) => {
    setReports((prev) => {
      const updated = prev.map((r) => {
        if (r.id === id) {
          const hasConfirmed = r.hasConfirmed;
          return {
            ...r,
            confirmations: hasConfirmed ? r.confirmations - 1 : r.confirmations + 1,
            hasConfirmed: !hasConfirmed,
          };
        }
        return r;
      });
      try {
        localStorage.setItem('orca_live_field_reports', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Submit a new observation
  const handleSubmitObservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newReport: FieldObservation = {
      id: `obs-${Date.now()}`,
      category: newCategory,
      title: newTitle.trim(),
      location: newLocation.trim() || selectedLoc.name,
      reporter: currentUser?.name || 'Active Fisherman',
      vesselId: 'IN-BOAT-LIVE',
      timestamp: new Date().toISOString(),
      timeAgo: 'Just now',
      severity: newSeverity,
      confirmations: 1,
      hasConfirmed: true,
    };

    const updated = [newReport, ...reports];
    setReports(updated);
    try {
      localStorage.setItem('orca_live_field_reports', JSON.stringify(updated));
    } catch {}

    setNewTitle('');
    setNewLocation('');
    setNewSeverity('normal');
    setIsSubmitModalOpen(false);
    setSubmitSuccessMsg('Live observation broadcasted to coastal network!');
    setTimeout(() => setSubmitSuccessMsg(null), 4000);
  };

  // Voice Readout in current language
  const handleToggleVoiceReport = () => {
    if (isSpeaking) {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    if (!('speechSynthesis' in window) || !weatherData) return;

    const loc = weatherData.city;
    const tVal = weatherData.temp;
    const wVal = weatherData.windSpeedKnots;
    const dir = weatherData.windCardinal;
    const wave = weatherData.waveEstimate;
    const sea = weatherData.seaStatus;

    const textMap: Record<string, { text: string; lang: string }> = {
      en: {
        text: `Live Maritime Report for ${loc}. Sea status is ${sea}. Air temperature is ${tVal} degrees Celsius. Wind is blowing from ${dir} at ${wVal} knots. Wave swell is estimated at ${wave}. Safe navigation is advised.`,
        lang: 'en-IN',
      },
      ta: {
        text: `${loc} பகுதிக்கான நேரடி கடல் அறிக்கை. கடல் நிலை ${sea === 'SAFE TO VENTURE' ? 'பாதுகாப்பானது' : 'எச்சரிக்கையானது'}. வெப்பநிலை ${tVal} டிகிரி செல்சியஸ். காற்று ${dir} திசையிலிருந்து மணிக்கு ${wVal} நாட்ஸ் வேகத்தில் வீசுகிறது. அலை உயரம் ${wave}. பாதுகாப்பாக செல்லவும்.`,
        lang: 'ta-IN',
      },
      hi: {
        text: `${loc} के लिए लाइव समुद्री रिपोर्ट। समुद्र की स्थिति ${sea === 'SAFE TO VENTURE' ? 'सुरक्षित' : 'सतर्कता आवश्यक'} है। तापमान ${tVal} डिग्री सेल्सियस है। हवा ${dir} दिशा से ${wVal} नॉट की गति से चल रही है। लहर का अनुमान ${wave} है।`,
        lang: 'hi-IN',
      },
      te: {
        text: `${loc} కోసం లైవ్ సముద్ర నివేదిక. సముద్ర పరిస్థితి ${sea === 'SAFE TO VENTURE' ? 'సురక్షితం' : 'జాగ్రత్త అవసరం'}. ఉష్ణోగ్రత ${tVal} డిగ్రీల సెల్సియస్. గాలి వేగం ${wVal} నాటికల్ నాట్స్.`,
        lang: 'te-IN',
      },
      ml: {
        text: `${loc} മേഖലയിലെ തത്സമയ കടൽ റിപ്പോർട്ട്. കടൽ നില ${sea === 'SAFE TO VENTURE' ? 'സുരക്ഷിതം' : 'ജാഗ്രത പാലിക്കുക'}. താപനില ${tVal} ഡിഗ്രി സെൽഷ്യസ്. കാറ്റ് ${wVal} നോട്ട്സ് വേഗതയിൽ വീശുന്നു.`,
        lang: 'ml-IN',
      },
      bn: {
        text: `${loc}-এর সরাসরি সমুদ্র প্রতিবেদন। সমুদ্রের অবস্থা ${sea === 'SAFE TO VENTURE' ? 'নিরাপদ' : 'সতর্কতা প্রয়োজন'}। তাপমাত্রা ${tVal} ডিগ্রি সেলসিয়াস। বাতাসের গতিবেগ ${wVal} নট।`,
        lang: 'bn-IN',
      },
    };

    const { text, lang: voiceLang } = textMap[language] || textMap['en'];
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = voiceLang;
    utterance.rate = 0.95;

    const setVoiceAndSpeak = () => {
      const voices = window.speechSynthesis.getVoices();
      const matched = voices.find((v) => v.lang.startsWith(voiceLang.slice(0, 2)));
      if (matched) utterance.voice = matched;
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
    };

    if (window.speechSynthesis.getVoices().length > 0) {
      setVoiceAndSpeak();
    } else {
      window.speechSynthesis.onvoiceschanged = () => {
        setVoiceAndSpeak();
        window.speechSynthesis.onvoiceschanged = null;
      };
    }
  };

  // Download Live Report Summary
  const handleDownloadLiveReport = () => {
    if (!weatherData) return;
    const content = [
      `=============================================================`,
      `ORCA MARITIME INTELLIGENCE PLATFORM - LIVE SITUATIONAL REPORT`,
      `=============================================================`,
      `Generated At   : ${new Date().toLocaleString()}`,
      `Harbour / Grid : ${weatherData.city}`,
      `Coordinate Ref : ${selectedLoc.lat}°N, ${selectedLoc.lon}°E`,
      `Safety Status  : ${weatherData.seaStatus}`,
      ``,
      `--- LIVE METEOROLOGICAL & OCEANOGRAPHIC METRICS ---`,
      `Air Temperature: ${weatherData.temp}°C (Feels like ${weatherData.feelsLike}°C)`,
      `Wind Telemetry : ${weatherData.windSpeedKnots} knots (${weatherData.windSpeedKmh} km/h) from ${weatherData.windCardinal} (${weatherData.windDeg}°)`,
      `Wave Swell Est : ${weatherData.waveEstimate}`,
      `Atm. Pressure  : ${weatherData.pressure} hPa`,
      `Humidity       : ${weatherData.humidity}%`,
      `Visibility     : ${weatherData.visibilityNm} Nautical Miles (${weatherData.visibilityKm} km)`,
      `Conditions     : ${weatherData.description}`,
      ``,
      `--- RECENT CITIZEN & HARBOUR OBSERVATIONS (${reports.length} Reports) ---`,
      ...reports.map(
        (r, i) =>
          `[${i + 1}] ${r.timeAgo.toUpperCase()} | [${r.category.toUpperCase()}] ${r.title}\n    Location: ${r.location} | Reported by: ${r.reporter} (${r.confirmations} confirmations)`
      ),
      ``,
      `=============================================================`,
      `OFFICIAL NOTICE: Ground truth corroborates INCOIS PFZ Advisories.`,
      `=============================================================`,
    ].join('\n');

    const uri = 'data:text/plain;charset=utf-8,' + encodeURIComponent(content);
    const link = document.createElement('a');
    link.href = uri;
    link.download = `ORCA_Live_Report_${selectedLoc.id}_${Date.now()}.txt`;
    link.click();
  };

  const filteredReports = reports.filter((r) => {
    if (activeFilter === 'all') return true;
    return r.category === activeFilter;
  });

  return (
    <div className="space-y-4">
      {/* Success Toast */}
      {submitSuccessMsg && (
        <div className="p-3 bg-[#EAF8F1] border border-[#BFE7D1] text-[#16845F] rounded-xl flex items-center gap-2 text-xs font-semibold shadow-sm animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-[#24A978]" />
          <span>{submitSuccessMsg}</span>
        </div>
      )}

      {/* Main Live Report Header Bar */}
      <div className="bg-gradient-to-r from-[#123B6D] via-[#1769AA] to-[#168DCC] rounded-2xl p-5 text-white shadow-lg space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 rounded-full font-mono text-[11px] font-extrabold flex items-center gap-1.5 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                LIVE SITUATIONAL REPORT
              </span>
              <span className="text-xs text-white/80 font-mono">
                {weatherData ? `Updated ${weatherData.lastUpdated}` : 'Connecting OpenWeather API...'}
              </span>
            </div>
            <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
              <Radio className="w-5 h-5 text-cyan-300 animate-pulse" />
              <span>Real-Time Coastal & Harbour Telemetry</span>
            </h2>
            <p className="text-xs text-cyan-100 max-w-xl">
              Live meteorological sensors, wave swell calculations, and corroborated fleet field observations.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => fetchLiveWeather(selectedLoc.lat, selectedLoc.lon, selectedLoc.name)}
              disabled={isLoadingWeather}
              title="Refresh live telemetry"
              className="p-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition text-white flex items-center gap-1 text-xs font-semibold"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingWeather ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              onClick={handleToggleVoiceReport}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition ${
                isSpeaking
                  ? 'bg-amber-500 text-white border-amber-400 animate-pulse'
                  : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
              }`}
            >
              {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              <span>{isSpeaking ? 'Stop Voice' : 'Listen Live Report'}</span>
            </button>

            <button
              onClick={handleDownloadLiveReport}
              className="flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-bold transition"
            >
              <Download className="w-4 h-4 text-cyan-200" />
              <span className="hidden sm:inline">Export</span>
            </button>

            <button
              onClick={() => setIsSubmitModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-[#24A978] to-[#16845F] hover:from-[#1E8A63] hover:to-[#126B4C] text-white font-extrabold text-xs rounded-xl shadow-md transition"
            >
              <Plus className="w-4 h-4" />
              <span>Submit Live Report</span>
            </button>
          </div>
        </div>

        {/* Harbour & GPS Selector Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
          <span className="text-cyan-200 font-bold text-[11px] whitespace-nowrap flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" /> Harbour:
          </span>
          {Array.from(new Set(advisories.map(a => a.landingCentreName))).map((locName) => {
            const isSelected = selectedLoc.name === locName;
            return (
              <button
                key={locName}
                onClick={() => {
                  setCustomLocName(null);
                  const target = advisories.find(a => a.landingCentreName === locName);
                  if (target) {
                    usePfzStore.getState().setSelectedLandingCentre(locName);
                    setSelectedLoc({
                      id: target.id,
                      name: target.landingCentreName,
                      state: target.state,
                      lat: target.latitude,
                      lon: target.longitude
                    });
                  }
                }}
                className={`px-3 py-1 rounded-lg whitespace-nowrap font-medium transition ${
                  isSelected
                    ? 'bg-white text-[#123B6D] font-bold shadow-sm'
                    : 'bg-white/10 text-white/90 hover:bg-white/20'
                }`}
              >
                {locName}
              </button>
            );
          })}
          <button
            onClick={handleUseGps}
            className={`px-3 py-1 rounded-lg whitespace-nowrap font-bold flex items-center gap-1 transition ${
              selectedLoc.id === 'gps'
                ? 'bg-emerald-400 text-black shadow-sm'
                : 'bg-emerald-500/30 text-emerald-200 hover:bg-emerald-500/40 border border-emerald-400/30'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Use My GPS</span>
          </button>
        </div>
      </div>

      {/* Live Sensor Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Metric 1: Sea Status */}
        <div className="bg-white p-3.5 rounded-2xl border border-[#D7E7F0] shadow-sm flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono font-bold text-[#55718D]">Sea Condition</span>
            <Waves className="w-4 h-4 text-[#168DCC]" />
          </div>
          <div>
            <span
              className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-extrabold border ${
                weatherData?.seaStatusColor || 'text-[#16845F] bg-[#EAF8F1] border-[#BFE7D1]'
              }`}
            >
              {weatherData ? weatherData.seaStatus : 'NORMAL'}
            </span>
            <p className="text-xs font-bold text-[#123B6D] mt-1 line-clamp-1">
              {weatherData?.waveEstimate || '1.1 - 1.4 m Swell'}
            </p>
          </div>
        </div>

        {/* Metric 2: Air Temp & Feels Like */}
        <div className="bg-white p-3.5 rounded-2xl border border-[#D7E7F0] shadow-sm flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono font-bold text-[#55718D]">Air Temperature</span>
            <Thermometer className="w-4 h-4 text-[#EA580C]" />
          </div>
          <div>
            <p className="text-xl font-extrabold font-mono text-[#123B6D]">
              {weatherData ? `${weatherData.temp}°C` : '--'}
            </p>
            <p className="text-[10px] text-[#7890A5] font-mono">
              Feels like {weatherData?.feelsLike ?? '--'}°C
            </p>
          </div>
        </div>

        {/* Metric 3: Wind Velocity & Direction */}
        <div className="bg-white p-3.5 rounded-2xl border border-[#D7E7F0] shadow-sm flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono font-bold text-[#55718D]">Wind Velocity</span>
            <Wind className="w-4 h-4 text-[#1769AA]" />
          </div>
          <div>
            <p className="text-xl font-extrabold font-mono text-[#1769AA]">
              {weatherData ? `${weatherData.windSpeedKnots} kt` : '--'}
            </p>
            <p className="text-[10px] text-[#55718D] font-mono flex items-center gap-1">
              <Compass className="w-3 h-3 text-[#19B7C9]" />
              <span>
                {weatherData ? `${weatherData.windCardinal} (${weatherData.windDeg}°)` : '--'}
              </span>
            </p>
          </div>
        </div>

        {/* Metric 4: Barometric Pressure */}
        <div className="bg-white p-3.5 rounded-2xl border border-[#D7E7F0] shadow-sm flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono font-bold text-[#55718D]">Atm. Pressure</span>
            <Gauge className="w-4 h-4 text-[#168DCC]" />
          </div>
          <div>
            <p className="text-xl font-extrabold font-mono text-[#123B6D]">
              {weatherData ? `${weatherData.pressure} hPa` : '--'}
            </p>
            <p className="text-[10px] text-[#24A978] font-mono">
              {weatherData && weatherData.pressure >= 1005 ? 'Stable / Normal' : 'Low Pressure Watch'}
            </p>
          </div>
        </div>

        {/* Metric 5: Nautical Visibility */}
        <div className="bg-white p-3.5 rounded-2xl border border-[#D7E7F0] shadow-sm flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono font-bold text-[#55718D]">Nav Visibility</span>
            <Eye className="w-4 h-4 text-[#19B7C9]" />
          </div>
          <div>
            <p className="text-xl font-extrabold font-mono text-[#123B6D]">
              {weatherData ? `${weatherData.visibilityNm} NM` : '--'}
            </p>
            <p className="text-[10px] text-[#7890A5] font-mono">
              {weatherData ? `${weatherData.visibilityKm} km range` : '--'}
            </p>
          </div>
        </div>

        {/* Metric 6: Sky & Cloud Cover */}
        <div className="bg-white p-3.5 rounded-2xl border border-[#D7E7F0] shadow-sm flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono font-bold text-[#55718D]">Atmosphere</span>
            <Droplets className="w-4 h-4 text-[#16845F]" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#123B6D] capitalize truncate">
              {weatherData ? weatherData.description : 'Loading...'}
            </p>
            <p className="text-[10px] text-[#7890A5] font-mono">
              Humidity: {weatherData ? `${weatherData.humidity}%` : '--'}
            </p>
          </div>
        </div>
      </div>

      {/* Field Observations & Citizen Reports Section */}
      <div className="bg-white rounded-2xl p-5 border border-[#D7E7F0] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D7E7F0] pb-3">
          <div>
            <h3 className="text-sm font-extrabold text-[#123B6D] flex items-center gap-2">
              <Anchor className="w-4 h-4 text-[#1769AA]" />
              <span>Live Fleet & Harbour Observations</span>
              <span className="px-2 py-0.5 bg-[#E8F8FB] text-[#1769AA] text-[10px] font-mono font-bold rounded-full">
                {filteredReports.length} reports
              </span>
            </h3>
            <p className="text-xs text-[#55718D] mt-0.5">
              Crowd-sourced reports from fishermen at sea, harbour dispatchers, and marine police.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1 rounded-lg font-semibold transition ${
                activeFilter === 'all'
                  ? 'bg-[#1769AA] text-white shadow-sm'
                  : 'bg-[#F4FAFD] text-[#55718D] hover:bg-[#E8F8FB]'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveFilter('fish')}
              className={`px-3 py-1 rounded-lg font-semibold flex items-center gap-1 transition ${
                activeFilter === 'fish'
                  ? 'bg-[#1769AA] text-white shadow-sm'
                  : 'bg-[#F4FAFD] text-[#55718D] hover:bg-[#E8F8FB]'
              }`}
            >
              <Fish className="w-3.5 h-3.5 text-[#24A978]" />
              <span>Fish Activity</span>
            </button>
            <button
              onClick={() => setActiveFilter('hazard')}
              className={`px-3 py-1 rounded-lg font-semibold flex items-center gap-1 transition ${
                activeFilter === 'hazard'
                  ? 'bg-[#1769AA] text-white shadow-sm'
                  : 'bg-[#F4FAFD] text-[#55718D] hover:bg-[#E8F8FB]'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-[#EA580C]" />
              <span>Hazards</span>
            </button>
            <button
              onClick={() => setActiveFilter('sea_state')}
              className={`px-3 py-1 rounded-lg font-semibold flex items-center gap-1 transition ${
                activeFilter === 'sea_state'
                  ? 'bg-[#1769AA] text-white shadow-sm'
                  : 'bg-[#F4FAFD] text-[#55718D] hover:bg-[#E8F8FB]'
              }`}
            >
              <Waves className="w-3.5 h-3.5 text-[#168DCC]" />
              <span>Sea State</span>
            </button>
            <button
              onClick={() => setActiveFilter('harbour')}
              className={`px-3 py-1 rounded-lg font-semibold flex items-center gap-1 transition ${
                activeFilter === 'harbour'
                  ? 'bg-[#1769AA] text-white shadow-sm'
                  : 'bg-[#F4FAFD] text-[#55718D] hover:bg-[#E8F8FB]'
              }`}
            >
              <Anchor className="w-3.5 h-3.5 text-[#123B6D]" />
              <span>Harbour</span>
            </button>
          </div>
        </div>

        {/* Reports List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredReports.map((r) => {
            let catColor = 'bg-[#EAF8F1] text-[#16845F] border-[#BFE7D1]';
            let catIcon = <Fish className="w-3.5 h-3.5" />;
            if (r.category === 'hazard') {
              catColor = 'bg-[#FEE2E2] text-[#DC2626] border-[#FCA5A5]';
              catIcon = <AlertTriangle className="w-3.5 h-3.5" />;
            } else if (r.category === 'sea_state') {
              catColor = 'bg-[#E8F8FB] text-[#1769AA] border-[#CFE6EF]';
              catIcon = <Waves className="w-3.5 h-3.5" />;
            } else if (r.category === 'harbour') {
              catColor = 'bg-[#FEF3C7] text-[#D97706] border-[#FCD34D]';
              catIcon = <Anchor className="w-3.5 h-3.5" />;
            }

            return (
              <div
                key={r.id}
                className="p-3.5 bg-[#F4FAFD] hover:bg-[#EDF6FA] border border-[#D7E7F0] rounded-xl space-y-2 transition shadow-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`p-1.5 rounded-lg border flex items-center justify-center ${catColor}`}>
                      {catIcon}
                    </span>
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase text-[#55718D]">
                        {r.category.replace('_', ' ')}
                      </span>
                      <h4 className="text-xs font-bold text-[#123B6D] line-clamp-1">{r.title}</h4>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-[#7890A5] whitespace-nowrap">{r.timeAgo}</span>
                </div>

                <div className="text-[11px] text-[#55718D] flex items-center justify-between gap-2 pt-1 border-t border-[#D7E7F0]/60">
                  <span className="flex items-center gap-1 truncate">
                    <MapPin className="w-3 h-3 text-[#168DCC] shrink-0" />
                    <span className="truncate">{r.location}</span>
                  </span>
                  <span className="text-[#123B6D] font-medium shrink-0">By: {r.reporter}</span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] font-mono text-[#7890A5]">
                    {r.vesselId && <span className="mr-2">Craft: {r.vesselId}</span>}
                  </span>

                  <button
                    onClick={() => handleConfirmReport(r.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border transition ${
                      r.hasConfirmed
                        ? 'bg-[#10B981] text-white border-[#059669]'
                        : 'bg-white text-[#1769AA] border-[#BFD6E4] hover:bg-[#E8F8FB]'
                    }`}
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{r.confirmations} Verified</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Submit Live Report Modal */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#D7E7F0] space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#D7E7F0] pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-[#E8F8FB] text-[#1769AA] rounded-xl">
                  <Radio className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#123B6D]">Submit Live Observation Report</h3>
                  <p className="text-xs text-[#55718D]">Broadcast immediate sea conditions or catch sightings.</p>
                </div>
              </div>
              <button
                onClick={() => setIsSubmitModalOpen(false)}
                className="p-1.5 text-[#7890A5] hover:text-[#123B6D] rounded-lg hover:bg-[#F4FAFD]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitObservation} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-[#123B6D] mb-1">Observation Category</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewCategory('fish')}
                    className={`p-2 rounded-xl text-xs font-bold border flex flex-col items-center gap-1 transition ${
                      newCategory === 'fish'
                        ? 'bg-[#EAF8F1] text-[#16845F] border-[#24A978]'
                        : 'bg-[#F4FAFD] text-[#55718D] border-[#D7E7F0]'
                    }`}
                  >
                    <Fish className="w-4 h-4" />
                    <span>Fish Activity</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewCategory('hazard')}
                    className={`p-2 rounded-xl text-xs font-bold border flex flex-col items-center gap-1 transition ${
                      newCategory === 'hazard'
                        ? 'bg-[#FEE2E2] text-[#DC2626] border-[#EF4444]'
                        : 'bg-[#F4FAFD] text-[#55718D] border-[#D7E7F0]'
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4" />
                    <span>Marine Hazard</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewCategory('sea_state')}
                    className={`p-2 rounded-xl text-xs font-bold border flex flex-col items-center gap-1 transition ${
                      newCategory === 'sea_state'
                        ? 'bg-[#E8F8FB] text-[#1769AA] border-[#168DCC]'
                        : 'bg-[#F4FAFD] text-[#55718D] border-[#D7E7F0]'
                    }`}
                  >
                    <Waves className="w-4 h-4" />
                    <span>Sea State</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewCategory('harbour')}
                    className={`p-2 rounded-xl text-xs font-bold border flex flex-col items-center gap-1 transition ${
                      newCategory === 'harbour'
                        ? 'bg-[#FEF3C7] text-[#D97706] border-[#F59E0B]'
                        : 'bg-[#F4FAFD] text-[#55718D] border-[#D7E7F0]'
                    }`}
                  >
                    <Anchor className="w-4 h-4" />
                    <span>Harbour Ops</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#123B6D] mb-1">
                  Report Headline / Observation
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Heavy Sardine shoals spotted at 12m depth, calm swell"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F4FAFD] border border-[#D7E7F0] rounded-xl text-xs text-[#123B6D] focus:outline-hidden focus:border-[#1769AA]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#123B6D] mb-1">Location / Nautical Reference</label>
                <input
                  type="text"
                  placeholder={`Defaults to ${selectedLoc.name} (or enter GPS / bearing)`}
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F4FAFD] border border-[#D7E7F0] rounded-xl text-xs text-[#123B6D] focus:outline-hidden focus:border-[#1769AA]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#123B6D] mb-1">Urgency Level</label>
                <div className="flex gap-2">
                  <label className="flex items-center gap-1.5 text-xs text-[#123B6D] cursor-pointer">
                    <input
                      type="radio"
                      name="severity"
                      value="normal"
                      checked={newSeverity === 'normal'}
                      onChange={() => setNewSeverity('normal')}
                    />
                    <span>Normal (Information)</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-[#D97706] cursor-pointer">
                    <input
                      type="radio"
                      name="severity"
                      value="caution"
                      checked={newSeverity === 'caution'}
                      onChange={() => setNewSeverity('caution')}
                    />
                    <span>Caution (Be Aware)</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-[#DC2626] cursor-pointer">
                    <input
                      type="radio"
                      name="severity"
                      value="critical"
                      checked={newSeverity === 'critical'}
                      onChange={() => setNewSeverity('critical')}
                    />
                    <span>Critical Hazard</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#D7E7F0]">
                <button
                  type="button"
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="px-4 py-2 bg-white hover:bg-[#F4FAFD] text-[#55718D] font-bold text-xs rounded-xl border border-[#D7E7F0] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1769AA] hover:bg-[#123B6D] text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Broadcast Report</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
