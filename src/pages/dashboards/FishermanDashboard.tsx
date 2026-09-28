import React, { useState } from 'react';
import {
  Fish,
  Navigation,
  Wind,
  Waves,
  AlertTriangle,
  Radio,
  Volume2,
  VolumeX,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Clock,
  Mic,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { usePfzStore } from '../../store/pfzStore';
import { useSosStore } from '../../store/sosStore';
import { useChatStore } from '../../store/chatStore';
import { useAuthStore } from '../../store/authStore';
import { CompassBearing } from '../../components/common/CompassBearing';
import { SafetyDisclaimer } from '../../components/common/SafetyDisclaimer';
import { LiveReport } from '../../components/dashboard/LiveReport';
import { VoiceCockpit } from '../../components/voice/VoiceCockpit';
import { Link, useNavigate } from 'react-router-dom';

export const FishermanDashboard: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { advisories, selectedLandingCentre, setSelectedLandingCentre } = usePfzStore();
  const { openTriggerModal } = useSosStore();
  const { openChat, sendMessage } = useChatStore();
  const { language } = useAuthStore();

  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const landingCentres = Array.from(new Set(advisories.map((a) => a.landingCentreName)));

  const filteredAdvisories = selectedLandingCentre === 'ALL'
    ? advisories
    : advisories.filter((a) => a.landingCentreName === selectedLandingCentre);

  const publishedAdvisories = filteredAdvisories.filter((a) => a.status === 'published');
  const primeAdvisory = publishedAdvisories[0] || filteredAdvisories[0] || advisories[0];

  const toggleAudioAdvisory = () => {
    if (!primeAdvisory) return;

    if (isPlayingAudio) {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    if (!('speechSynthesis' in window)) return;

    // Build advisory text in the currently selected app language
    const bearing = primeAdvisory.bearingDegrees;
    const distance = primeAdvisory.distanceFromLandingCentre;
    const depth = primeAdvisory.depth;
    const species = primeAdvisory.targetSpecies.slice(0, 2).join(', ');
    const zone = primeAdvisory.name;

    const textMap: Record<string, { text: string; lang: string }> = {
      en: {
        text: `Attention skippers. Today's primary fishing zone is ${zone}, at bearing ${bearing} degrees, distance ${distance} nautical miles, depth ${depth} meters. Good aggregation of ${species} reported.`,
        lang: 'en-IN',
      },
      ta: {
        text: `மீனவர் கவனத்திற்கு. இன்றைய முதன்மை மீன்பிடி மண்டலம் ${zone}. திசை ${bearing} டிகிரி, தூரம் ${distance} கடல் மைல், ஆழம் ${depth} மீட்டர். ${species} நல்ல அளவில் இருப்பதாக தெரிவிக்கப்பட்டுள்ளது.`,
        lang: 'ta-IN',
      },
      hi: {
        text: `मछुआरों के लिए सूचना। आज का प्रमुख मछली पकड़ने का क्षेत्र ${zone} है। दिशा ${bearing} डिग्री, दूरी ${distance} नॉटिकल मील, गहराई ${depth} मीटर। ${species} का अच्छा जमाव बताया गया है।`,
        lang: 'hi-IN',
      },
      te: {
        text: `మత్స్యకారులకు సందేశం. నేటి ప్రధాన మత్స్య క్షేత్రం ${zone}. దిక్కు ${bearing} డిగ్రీలు, దూరం ${distance} నాటికల్ మైళ్ళు, లోతు ${depth} మీటర్లు. ${species} బాగా లభిస్తున్నాయి.`,
        lang: 'te-IN',
      },
      ml: {
        text: `മത്സ്യത്തൊഴിലാളികൾക്ക് അറിയിപ്പ്. ഇന്നത്തെ പ്രധാന മത്സ്യബന്ധന മേഖല ${zone} ആണ്. ദിശ ${bearing} ഡിഗ്രി, ദൂരം ${distance} നോട്ടിക്കൽ മൈൽ, ആഴം ${depth} മീറ്റർ. ${species} ധാരാളമായി കാണുന്നു.`,
        lang: 'ml-IN',
      },
      bn: {
        text: `মৎস্যজীবীদের জন্য বার্তা। আজকের প্রধান মৎস্য অঞ্চল ${zone}। দিক ${bearing} ডিগ্রি, দূরত্ব ${distance} নটিক্যাল মাইল, গভীরতা ${depth} মিটার। ${species} ভালো পাওয়া যাচ্ছে।`,
        lang: 'bn-IN',
      },
    };

    const { text, lang: voiceLang } = textMap[language] || textMap['en'];
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = voiceLang;
    utterance.rate = 0.92;
    utterance.pitch = 1;

    // Try to find a matching voice for the selected language
    const setVoiceAndSpeak = () => {
      const voices = window.speechSynthesis.getVoices();
      const matchedVoice = voices.find((v) => v.lang.startsWith(voiceLang.slice(0, 2)));
      if (matchedVoice) utterance.voice = matchedVoice;
      setIsPlayingAudio(true);
      window.speechSynthesis.speak(utterance);
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
    };

    // Voices may not be loaded yet on first call
    if (window.speechSynthesis.getVoices().length > 0) {
      setVoiceAndSpeak();
    } else {
      window.speechSynthesis.onvoiceschanged = () => {
        setVoiceAndSpeak();
        window.speechSynthesis.onvoiceschanged = null;
      };
    }
  };

  if (!primeAdvisory) {
    return (
      <div className="flex items-center justify-center h-64 border-2 border-dashed border-[#D7E7F0] rounded-2xl">
        <p className="text-[#55718D] font-medium">{t('fisherman.noAdvisories', 'No active advisories found at this time.')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Welcome / Status Banner with Sunset Fishing Boat Image */}
      <div
        className="relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl border border-[#563943] shadow-xl"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(20, 12, 20, 0.94) 0%, rgba(26, 17, 24, 0.88) 38%, rgba(36, 24, 30, 0.45) 75%, rgba(20, 12, 20, 0.2) 100%), url('/sunset-boat.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center right',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="space-y-1.5 relative z-10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-[#0C5240] text-[#10B981] border border-[#047857] rounded font-mono text-xs font-bold flex items-center gap-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
              {t('fisherman.liveAdvisory', 'INCOIS LIVE ADVISORY ACTIVE')}
            </span>
            <select
              value={selectedLandingCentre}
              onChange={(e) => setSelectedLandingCentre(e.target.value)}
              className="bg-[#24181E]/60 text-xs text-[#D4C2B6] font-mono border border-[#563943] rounded px-2 py-0.5 outline-none focus:border-[#E7A928] transition-colors appearance-none cursor-pointer hover:bg-[#2E1D27]/80"
              title="Change Location"
            >
              <option value="ALL">All Locations</option>
              {landingCentres.map((lc) => (
                <option key={lc} value={lc}>
                  {lc}
                </option>
              ))}
            </select>
          </div>
          <h1 className="text-2xl font-extrabold text-[#FFF6EE] tracking-tight drop-shadow-md">
            {t('dashboards.fishermanTitle', 'Fisherman Maritime Operations Center')}
          </h1>
          <p className="text-xs text-[#D4C2B6] max-w-xl leading-relaxed">
            {t('fisherman.centerSubtitle', 'Real-time Potential Fishing Zones, navigation compass bearings, wave safety, and emergency dispatch.')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 relative z-10">
          {/* Voice Assistant Anchor Button */}
          <a
            href="#voice-assistant-section"
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-gradient-to-r from-[#1769AA] to-[#168DCC] hover:from-[#123B6D] hover:to-[#1769AA] text-white font-extrabold text-xs rounded-xl shadow-md border border-[#19B7C9]/30 transition"
          >
            <Mic className="w-4 h-4 text-[#19B7C9] animate-pulse" />
            <span>{t('voice.title', 'Voice Assistant')}</span>
          </a>

          {/* Live Marine Report Button */}
          <a
            href="#live-report-section"
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-gradient-to-r from-[#0C5240] to-[#047857] hover:from-[#047857] hover:to-[#065F46] text-white font-extrabold text-xs rounded-xl shadow-md border border-[#10B981]/30 transition"
          >
            <Radio className="w-4 h-4 text-[#10B981] animate-pulse" />
            <span>{t('fisherman.liveReport', 'Live Report')}</span>
          </a>

          {/* Audio Advisory Voice Button */}
          <button
            onClick={toggleAudioAdvisory}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border transition shadow-md ${
              isPlayingAudio
                ? 'bg-[#EA580C] text-white border-[#F97316] animate-pulse shadow-lg'
                : 'bg-gradient-to-r from-[#D95202] to-[#B8470B] hover:from-[#EA580C] hover:to-[#C2410C] text-white border-[#E66F23]'
            }`}
          >
            {isPlayingAudio ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span>{isPlayingAudio ? t('fisherman.stopVoice', 'Stop Audio Broadcast') : t('fisherman.listenVoice', 'Listen Voice Advisory')}</span>
          </button>

          {/* Big SOS Trigger Button */}
          <button
            onClick={openTriggerModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#FC4448] to-[#EF4444] hover:from-[#EF4444] hover:to-[#DC2626] text-white font-extrabold text-xs tracking-wider rounded-xl shadow-lg border border-[#FCA5A5]/30 transition"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>{t('sos.triggerButton', 'EMERGENCY SOS')}</span>
          </button>
        </div>
      </div>

      {/* Primary Voice Cockpit Interface */}
      <div id="voice-assistant-section" className="scroll-mt-6">
        <VoiceCockpit />
      </div>

      {/* Statutory Disclaimer */}
      <SafetyDisclaimer />

      {/* Main Prime Navigation Cockpit Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Prime PFZ Target */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-[#D7E7F0] shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#D7E7F0] pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-[#EAF8F1] text-[#24A978] rounded-xl">
                <Fish className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-[#24A978] font-bold tracking-wider">
                  {t('fisherman.highestConfidence', "TODAY'S HIGHEST CONFIDENCE ZONE")}
                </span>
                <h3 className="text-lg font-bold text-[#123B6D] leading-tight">{primeAdvisory.name}</h3>
              </div>
            </div>

            <span className="px-2.5 py-1 bg-[#E8F8FB] text-[#1769AA] border border-[#BFD6E4] rounded-full text-xs font-mono font-bold self-start sm:self-auto">
              {t('fisherman.sector', 'Sector:')} {primeAdvisory.sector}
            </span>
          </div>

          {/* Compass & Telemetry Layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            {/* Compass Widget */}
            <CompassBearing
              bearingDegrees={primeAdvisory.bearingDegrees}
              directionText={primeAdvisory.directionFromLandingCentre}
              distanceKm={primeAdvisory.distanceKm}
              distanceNM={primeAdvisory.distanceFromLandingCentre}
              landingCentreName={primeAdvisory.landingCentreName}
              size="lg"
            />

            {/* Oceanographic Metrics */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 bg-[#F4FAFD] border border-[#D7E7F0] rounded-xl space-y-0.5">
                <span className="text-[10px] text-[#55718D] uppercase font-mono">{t('fisherman.operationalDepth', 'Operational Depth')}</span>
                <p className="text-base font-bold text-[#123B6D] font-mono">{primeAdvisory.depth} m</p>
                <p className="text-[10px] text-[#7890A5] font-mono">({primeAdvisory.depthFathoms} {t('fisherman.fathoms', 'fathoms')})</p>
              </div>

              <div className="p-3 bg-[#F4FAFD] border border-[#D7E7F0] rounded-xl space-y-0.5">
                <span className="text-[10px] text-[#55718D] uppercase font-mono">{t('fisherman.seaSurfaceTemp', 'Sea Surface Temp')}</span>
                <p className="text-base font-bold text-[#1769AA] font-mono">{primeAdvisory.seaSurfaceTemperature} °C</p>
                <p className="text-[10px] text-[#24A978] font-mono">{t('fisherman.optimalGradient', 'Optimal Gradient')}</p>
              </div>

              <div className="p-3 bg-[#F4FAFD] border border-[#D7E7F0] rounded-xl space-y-0.5">
                <span className="text-[10px] text-[#55718D] uppercase font-mono">{t('fisherman.chlorophyll', 'Chlorophyll-a')}</span>
                <p className="text-base font-bold text-[#168DCC] font-mono">{primeAdvisory.chlorophyll} mg/m³</p>
                <p className="text-[10px] text-[#19B7C9] font-mono">{t('fisherman.highPlankton', 'High Plankton')}</p>
              </div>

              <div className="p-3 bg-[#F4FAFD] border border-[#D7E7F0] rounded-xl space-y-0.5">
                <span className="text-[10px] text-[#55718D] uppercase font-mono">{t('fisherman.validityWindow', 'Validity Window')}</span>
                <p className="text-xs font-bold text-[#16845F] truncate">{t('fisherman.validUntil', 'Until Sep 13, 18:00')}</p>
                <p className="text-[10px] text-[#7890A5] font-mono">{t('fisherman.hoursLeft', '48 Hours Left')}</p>
              </div>
            </div>
          </div>

          {/* Target Species List */}
          <div className="space-y-1.5 pt-1">
            <span className="text-xs font-bold text-[#123B6D]">{t('fisherman.expectedSpecies', 'Expected Fish Aggregation:')}</span>
            <div className="flex flex-wrap gap-2">
              {primeAdvisory.targetSpecies.map((species) => (
                <span
                  key={species}
                  className="px-2.5 py-1 bg-[#F4FAFD] border border-[#D7E7F0] rounded-lg text-xs font-semibold text-[#1769AA] flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#19B7C9]" />
                  {species}
                </span>
              ))}
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-[#D7E7F0]">
            <Link
              to={`/map?focus=${primeAdvisory.id}`}
              className="flex-1 py-2.5 bg-[#1769AA] hover:bg-[#123B6D] text-white font-extrabold text-xs rounded-xl text-center shadow-sm transition flex items-center justify-center gap-2"
            >
              <Navigation className="w-4 h-4" />
              {t('fisherman.navigateMap', 'Navigate on Live Marine GIS Map')}
            </Link>

            <button
              onClick={() => {
                openChat();
                sendMessage(`Provide GPS coordinates and detailed fishing route for ${primeAdvisory.name}`);
              }}
              className="px-4 py-2.5 bg-white hover:bg-[#E8F8FB] text-[#123B6D] font-bold text-xs rounded-xl border border-[#BFD6E4] transition flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-[#19B7C9]" />
              {t('fisherman.askAi', 'Ask AI Assistant')}
            </button>
          </div>
        </div>

        {/* Right Col: Marine Weather & Sea Safety Telemetry */}
        <div className="space-y-4">
          {/* Weather & Wave Telemetry */}
          <div className="bg-white rounded-2xl p-5 border border-[#D7E7F0] shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#D7E7F0] pb-2.5">
              <div className="flex items-center gap-2 text-[#123B6D] font-bold text-sm">
                <Waves className="w-4 h-4 text-[#168DCC]" />
                <span>{t('fisherman.seaStateTitle', 'Sea State & Wave Safety')}</span>
              </div>
              <span className="px-2 py-0.5 bg-[#EAF8F1] text-[#16845F] border border-[#BFE7D1] rounded text-[10px] font-mono font-bold">
                {t('fisherman.safeToVenture', 'SAFE TO VENTURE')}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-2.5 bg-[#F4FAFD] border border-[#D7E7F0] rounded-xl">
                <span className="flex items-center gap-2 text-[#55718D]">
                  <Waves className="w-4 h-4 text-[#168DCC]" /> {t('fisherman.waveHeight', 'Significant Wave Height')}
                </span>
                <span className="font-mono font-bold text-[#123B6D] text-sm">1.2 — 1.5 m</span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-[#F4FAFD] border border-[#D7E7F0] rounded-xl">
                <span className="flex items-center gap-2 text-[#55718D]">
                  <Wind className="w-4 h-4 text-[#168DCC]" /> {t('fisherman.windSpeed', 'Surface Wind Speed')}
                </span>
                <span className="font-mono font-bold text-[#123B6D] text-sm">12 knots (SSW)</span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-[#F4FAFD] border border-[#D7E7F0] rounded-xl">
                <span className="flex items-center gap-2 text-[#55718D]">
                  <Clock className="w-4 h-4 text-[#168DCC]" /> {t('fisherman.tidalForecast', 'Tidal Forecast')}
                </span>
                <span className="font-mono font-bold text-[#1769AA] text-sm">{t('fisherman.highTide', 'High Tide: 14:20 (+1.1m)')}</span>
              </div>
            </div>

            <div className="p-3 bg-[#EAF8F1] border border-[#BFE7D1] rounded-xl text-[11px] text-[#16845F] flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0 text-[#24A978] mt-0.5" />
              <span>{t('fisherman.cycloneNotice', 'No cyclone warning active in Coromandel coastal grid. Normal motorized craft operations permitted.')}</span>
            </div>
          </div>

          {/* Quick Service & Support Help */}
          <div className="bg-white rounded-2xl p-4 border border-[#D7E7F0] shadow-sm space-y-3">
            <h4 className="font-bold text-[#123B6D] text-xs flex items-center gap-2">
              <Radio className="w-4 h-4 text-[#1769AA]" />
              <span>{t('fisherman.coastalLines', 'Direct Coastal Support Lines')}</span>
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 bg-[#F4FAFD] border border-[#D7E7F0] rounded-lg">
                <span className="text-[#55718D]">{t('fisherman.coastGuardHotline', 'Coast Guard SAR Hotline:')}</span>
                <a href="tel:1554" className="font-mono font-bold text-[#E7A928] hover:underline">1554</a>
              </div>
              <div className="flex items-center justify-between p-2 bg-[#F4FAFD] border border-[#D7E7F0] rounded-lg">
                <span className="text-[#55718D]">{t('fisherman.coastalPolice', 'Coastal Marine Police:')}</span>
                <a href="tel:1093" className="font-mono font-bold text-[#168DCC] hover:underline">1093</a>
              </div>
              <div className="flex items-center justify-between p-2 bg-[#F4FAFD] border border-[#D7E7F0] rounded-lg">
                <span className="text-[#55718D]">{t('fisherman.fieldAgent', 'Field Agent (Kavita S.):')}</span>
                <span className="font-mono text-[#123B6D]">+91 97910 88776</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Situational & Meteorological Report */}
      <div id="live-report-section" className="scroll-mt-6">
        <LiveReport />
      </div>

      {/* Secondary Active Advisories Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-[#123B6D] flex items-center gap-2">
            <Fish className="w-4 h-4 text-[#1769AA]" />
            <span>{t('fisherman.allAdvisories', 'All Published PFZ Advisories')} ({publishedAdvisories.length})</span>
          </h3>
          <Link to="/pfz" className="text-xs font-semibold text-[#1769AA] hover:underline flex items-center gap-1">
            <span>{t('fisherman.exploreAll', 'Explore All Coastal Zones')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {publishedAdvisories.slice(1, 4).map((adv) => (
            <div
              key={adv.id}
              className="bg-white hover:border-[#19B7C9] transition-all rounded-2xl p-4 space-y-3 cursor-pointer border border-[#D7E7F0] shadow-sm hover:shadow-md"
              onClick={() => navigate(`/pfz/${adv.id}`)}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="px-2 py-0.5 bg-[#E8F8FB] text-[#1769AA] border border-[#CFE6EF] rounded text-[10px] font-mono font-bold">
                    {adv.confidence} {t('fisherman.confidence', 'CONFIDENCE')}
                  </span>
                  <h4 className="font-bold text-[#123B6D] text-sm mt-1 line-clamp-1">{adv.name}</h4>
                </div>
              </div>

              <div className="p-2.5 bg-[#F4FAFD] border border-[#D7E7F0] rounded-xl grid grid-cols-2 gap-2 text-xs font-mono text-[#55718D]">
                <div>{t('fisherman.bearing', 'Bearing:')} <strong className="text-[#1769AA]">{adv.bearingDegrees}° {adv.directionFromLandingCentre}</strong></div>
                <div>{t('fisherman.dist', 'Dist:')} <strong className="text-[#123B6D]">{adv.distanceKm} km</strong></div>
                <div>{t('fisherman.depth', 'Depth:')} <strong className="text-[#123B6D]">{adv.depth} m</strong></div>
                <div>{t('fisherman.sst', 'SST:')} <strong className="text-[#1769AA]">{adv.seaSurfaceTemperature}°C</strong></div>
              </div>

              <p className="text-[11px] text-[#7890A5] line-clamp-2">{adv.description}</p>

              <div className="flex items-center justify-between text-xs pt-1 text-[#1769AA] font-semibold">
                <span>{t('fisherman.target', 'Target:')} {adv.targetSpecies[0]}</span>
                <span className="flex items-center gap-1">{t('fisherman.details', 'Details →')}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
