import React, { useState, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Waves,
  ShieldCheck,
  Radio,
  CheckCircle2,
  AlertTriangle,
  Globe,
  Settings,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/authStore';
import { LanguageCode } from '../../types';
import { VoiceSessionService } from '../../services/voice/voiceSessionService';
import { VoiceState } from '../../services/voice/types';
import { AgentQueryResult } from '../../services/agents/types';
import { LanguageMatrixModal } from './LanguageMatrixModal';

const QUICK_PROMPTS: Record<LanguageCode, { label: string; query: string }[]> = {
  ta: [
    { label: 'நாளைக்கு கடலுக்கு போகலாமா?', query: 'நாளைக்கு கடலுக்கு போகலாமா? கடல் நிலை எப்படி இருக்கும்?' },
    { label: 'இன்றைய சிறந்த PFZ மண்டலம் எது?', query: 'இன்றைய சிறந்த PFZ மண்டலம் எது?' },
    { label: 'அலை உயரம் & காற்றின் வேகம்', query: 'இன்றைய அலை உயரம் மற்றும் காற்றின் வேகம் என்ன?' },
    { label: 'அவசர உதவி (SOS) தகவல்', query: 'கடலில் அவசர உதவிக்கு யாரை தொடர்பு கொள்வது?' },
  ],
  hi: [
    { label: 'क्या कल समुद्र में जाना सुरक्षित है?', query: 'क्या कल सुबह मछली पकड़ने के लिए समुद्र में जाना सुरक्षित है?' },
    { label: 'आज का सबसे अच्छा PFZ क्षेत्र', query: 'आज का सबसे अच्छा मछली पकड़ने का क्षेत्र कौन सा है?' },
    { label: 'लहरों की ऊंचाई और हवा की गति', query: 'समुद्र में लहरों की ऊंचाई और हवा की गति क्या है?' },
    { label: 'आपातकालीन सहायता (SOS)', query: 'आपातकाल में तटरक्षक बल से कैसे संपर्क करें?' },
  ],
  te: [
    { label: 'రేపు సముద్రంలోకి వెళ్లవచ్చా?', query: 'రేపు చేపల వేటకు సముద్రంలోకి వెళ్లడం సురక్షితమేనా?' },
    { label: 'నేటి ఉత్తమ PFZ క్షేత్రం', query: 'నేటి అత్యుత్తమ సంభావ్య మత్స్య క్షేత్రం ఏది?' },
    { label: 'అలల ఎత్తు & గాలి వేగం', query: 'ప్రస్తుత అలల ఎత్తు మరియు గాలి వేగం ఎంత?' },
    { label: 'అత్యవసర సహాయం (SOS)', query: 'సముద్రంలో ఆపద వస్తే ఎవరిని సంప్రదించాలి?' },
  ],
  ml: [
    { label: 'നാളെ കടലിൽ പോകാമോ?', query: 'നാളെ രാവിലെ മത്സ്യബന്ധനത്തിന് കടലിൽ പോകുന്നത് സുരക്ഷിതമാണോ?' },
    { label: 'ഇന്നത്തെ മികച്ച PFZ മേഖല', query: 'ഇന്നത്തെ ഏറ്റവും മികച്ച മത്സ്യബന്ധന മേഖല ഏതാണ്?' },
    { label: 'തിരമാല ഉയരവും കാറ്റും', query: 'ഇന്നത്തെ തിരമാലയുടെ ഉയരവും കാറ്റിന്റെ വേഗതയും എത്രയാണ്?' },
    { label: 'അടിയന്തര സഹായം (SOS)', query: 'അടിയന്തര സാഹചര്യത്തിൽ കോസ്റ്റ് ഗാർഡിനെ എങ്ങനെ ബന്ധപ്പെടാം?' },
  ],
  kn: [
    { label: 'ನಾಳೆ ಸಮುದ್ರಕ್ಕೆ ಹೋಗಲು ಸುರಕ್ಷಿತವೇ?', query: 'ನಾಳೆ ಬೆಳಿಗ್ಗೆ ಮೀನುಗಾರಿಕೆಗೆ ಸಮುದ್ರಕ್ಕೆ ಹೋಗಲು ಸುರಕ್ಷಿತವೇ?' },
    { label: 'ಇಂದಿನ ಅತ್ಯುತ್ತಮ PFZ ವಲಯ', query: 'ಇಂದಿನ ಅತ್ಯುತ್ತಮ ಸಂಭಾವ್ಯ ಮೀನುಗಾರಿಕೆ ವಲಯ ಯಾವುದು?' },
    { label: 'ಅಲೆಗಳ ಎತ್ತರ ಮತ್ತು ಗಾಳಿಯ ವೇಗ', query: 'ಪ್ರಸ್ತುತ ಅಲೆಗಳ ಎತ್ತರ ಮತ್ತು ಗಾಳಿಯ ವೇಗ ಎಷ್ಟು?' },
    { label: 'ತುರ್ತು ಸಹಾಯ (SOS)', query: 'ಸಮುದ್ರದಲ್ಲಿ ತುರ್ತು ಸಹಾಯಕ್ಕೆ ಯಾರನ್ನು ಸಂಪರ್ಕಿಸಬೇಕು?' },
  ],
  bn: [
    { label: 'কাল কি সমুদ্রে যাওয়া নিরাপদ?', query: 'কাল সকালে মাছ ধরতে সমুদ্রে যাওয়া কি নিরাপদ হবে?' },
    { label: 'আজকের সেরা PFZ অঞ্চল', query: 'আজকের সবচেয়ে কার্যকর সম্ভাব্য মৎস্য অঞ্চল কোনটি?' },
    { label: 'ঢেউয়ের উচ্চতা ও বাতাসের গতি', query: 'বর্তমানে সমুদ্রের ঢেউয়ের উচ্চতা এবং বাতাসের গতি কত?' },
    { label: 'জরুরি সহায়তা (SOS)', query: 'জরুরি অবস্থায় কোস্ট গার্ডের সাথে কীভাবে যোগাযোগ করব?' },
  ],
  en: [
    { label: 'Is it safe to go fishing tomorrow?', query: 'Is it safe to venture out for fishing tomorrow morning?' },
    { label: 'Today\'s Highest Confidence PFZ', query: 'Show today\'s best Potential Fishing Zone with compass bearing' },
    { label: 'Wave Height & Surface Wind', query: 'What is the current significant wave height and wind speed?' },
    { label: 'Maritime Emergency SOS Hotline', query: 'What are the Coast Guard emergency SAR contacts?' },
  ],
};

const STATUS_LABELS: Record<LanguageCode, Record<VoiceState, string>> = {
  ta: {
    idle: 'பேச மைக் பட்டனை அழுத்தவும்',
    listening: 'கேட்கிறோம்... பேசுங்கள்',
    processing: 'புரிந்துகொள்கிறோம்...',
    thinking: 'கடல் தகவலை சரிபார்க்கிறோம்...',
    speaking: 'பதிலை வாசிக்கிறோம்...',
    paused: 'இடைநிறுத்தப்பட்டது',
    error: 'மன்னிக்கவும், விளங்கவில்லை. மீண்டும் முயற்சிக்கவும்.',
  },
  hi: {
    idle: 'बोलने के लिए माइक दबाएं',
    listening: 'सुन रहे हैं... बोलिए',
    processing: 'समझ रहे हैं...',
    thinking: 'समुद्री जानकारी जांची जा रही है...',
    speaking: 'उत्तर सुना रहे हैं...',
    paused: 'रोक दिया गया',
    error: 'क्षमा करें, समझ नहीं आया। पुनः प्रयास करें।',
  },
  te: {
    idle: 'మాట్లాడటానికి మైక్ నొక్కండి',
    listening: 'వింటున్నాము... మాట్లాడండి',
    processing: 'అర్థం చేసుకుంటున్నాము...',
    thinking: 'సముద్ర సమాచారాన్ని తనిఖీ చేస్తున్నాము...',
    speaking: 'సమాధానం వినిపిస్తున్నాము...',
    paused: 'విరామం ఇవ్వబడింది',
    error: 'క్షమించండి, అర్థం కాలేదు. మళ్లీ ప్రయత్నించండి.',
  },
  ml: {
    idle: 'സംസാരിക്കാൻ മൈക്ക് അമർത്തുക',
    listening: 'കേൾക്കുന്നു... സംസാരിക്കൂ',
    processing: 'മനസ്സിലാക്കുന്നു...',
    thinking: 'കടൽ വിവരങ്ങൾ പരിശോധിക്കുന്നു...',
    speaking: 'മറുപടി കേൾപ്പിക്കുന്നു...',
    paused: 'താൽക്കാലികമായി നിർത്തി',
    error: 'ക്ഷമിക്കണം, മനസ്സിലായില്ല. വീണ്ടും ശ്രമിക്കുക.',
  },
  kn: {
    idle: 'ಮಾತನಾಡಲು ಮೈಕ್ ಒತ್ತಿರಿ',
    listening: 'ಕೇಳಿಸಿಕೊಳ್ಳುತ್ತಿದ್ದೇವೆ... ಮಾತನಾಡಿ',
    processing: 'ಅರ್ಥೈಸಿಕೊಳ್ಳುತ್ತಿದ್ದೇವೆ...',
    thinking: 'ಸಮುದ್ರ ಮಾಹಿತಿಯನ್ನು ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ...',
    speaking: 'ಪ್ರತಿಕ್ರಿಯೆಯನ್ನು ಆಲಿಸಿ...',
    paused: 'ವಿರಾಮಗೊಳಿಸಲಾಗಿದೆ',
    error: 'ಕ್ಷಮಿಸಿ, ಅರ್ಥವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಇನ್ನೊಮ್ಮೆ ಪ್ರಯತ್ನಿಸಿ.',
  },
  bn: {
    idle: 'কথা বলতে মাইকে চাপ দিন',
    listening: 'শুনছি... বলুন',
    processing: 'বোঝার চেষ্টা করছি...',
    thinking: 'সামুদ্রিক তথ্য যাচাই করা হচ্ছে...',
    speaking: 'উত্তর শুনুন...',
    paused: 'বিরতি দেওয়া হয়েছে',
    error: 'দুঃখিত, বুঝতে পারিনি। আবার চেষ্টা করুন।',
  },
  en: {
    idle: 'Tap microphone to speak',
    listening: 'Listening... speak clearly',
    processing: 'Understanding speech...',
    thinking: 'Checking marine information...',
    speaking: 'Playing audio response...',
    paused: 'Audio Paused',
    error: 'Could not understand. Please try again.',
  },
};

export const VoiceCockpit: React.FC = () => {
  const { t } = useTranslation();
  const { language, setLanguage } = useAuthStore();

  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('Tap microphone to speak');
  const [userTranscript, setUserTranscript] = useState<string>('');
  const [aiResponse, setAiResponse] = useState<AgentQueryResult | null>(null);
  const [isMatrixOpen, setIsMatrixOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const voiceSession = VoiceSessionService.getInstance();
  const ttsManager = voiceSession.getTTSManager();

  useEffect(() => {
    voiceSession.setLanguage(language);
  }, [language, voiceSession]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const unsubscribe = voiceSession.subscribe({
      onStateChange: (state) => {
        setVoiceState(state);
        const localized =
          STATUS_LABELS[language]?.[state] || STATUS_LABELS.en[state] || 'Tap microphone to speak';
        setStatusMessage(localized);
      },
      onTranscript: (transcript) => setUserTranscript(transcript),
      onAiResponse: (res) => setAiResponse(res),
      onError: () => {
        const errorMsg =
          STATUS_LABELS[language]?.error || 'Could not understand. Please try again.';
        setStatusMessage(errorMsg);
      },
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsubscribe();
    };
  }, [language, voiceSession]);

  const handleMicClick = async () => {
    if (voiceState === 'listening') {
      await voiceSession.stopSession();
    } else {
      setUserTranscript('');
      await voiceSession.startSession(language);
    }
  };

  const handlePromptClick = async (promptQuery: string) => {
    setUserTranscript(promptQuery);
    setVoiceState('thinking');
    setStatusMessage(STATUS_LABELS[language]?.thinking || 'Checking marine information...');

    // Trigger complete multi-agent response & audio playback
    const session = VoiceSessionService.getInstance();
    (session as any).handleSttResult(promptQuery);
  };

  const isSpeaking = voiceState === 'speaking';
  const isPaused = voiceState === 'paused';
  const isListening = voiceState === 'listening';
  const isThinking = voiceState === 'thinking' || voiceState === 'processing';

  return (
    <>
      <div className="bg-white dark:bg-[#1E1216] border-2 border-[#1769AA]/20 dark:border-[#563943] rounded-3xl p-6 shadow-xl relative overflow-hidden transition-all duration-300">
        {/* Subtle Decorative Ocean Wave Radial Background */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#19B7C9]/10 via-[#1769AA]/5 to-transparent rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="relative z-10 space-y-6">
          {/* Top Bar: Title & Capabilities Check */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#D7E7F0] dark:border-[#3D2833]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#1769AA] to-[#19B7C9] flex items-center justify-center text-white shadow-md">
                <Mic className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black text-[#123B6D] dark:text-[#FFF6EE] tracking-tight">
                    {t('voice.title', 'ORCA Multilingual Voice Assistant')}
                  </h2>
                  <span className="px-2 py-0.5 bg-[#E8F8FB] dark:bg-[#2A1C24] text-[#1769AA] dark:text-[#E7A928] border border-[#BFD6E4] dark:border-[#563943] rounded-full text-[10px] font-mono font-bold">
                    7 LANGUAGES
                  </span>
                </div>
                <p className="text-xs text-[#55718D] dark:text-[#D4C2B6]">
                  Offline STT (whisper.cpp) • Multi-Agent Live Marine Intelligence • Local TTS
                </p>
              </div>
            </div>

            {/* Offline & Engine Status Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 bg-[#EAF8F1] dark:bg-[#122A1E] text-[#16845F] dark:text-[#34D399] border border-[#BFE7D1] dark:border-[#1F5438] rounded-full text-xs font-mono font-bold flex items-center gap-1.5 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
                🟢 Voice: Offline Ready
              </span>

              <span
                className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold flex items-center gap-1.5 border shadow-sm ${
                  isOnline
                    ? 'bg-[#EAF8F1] dark:bg-[#122A1E] text-[#16845F] dark:text-[#34D399] border-[#BFE7D1] dark:border-[#1F5438]'
                    : 'bg-[#FEE2E2] dark:bg-[#2D1515] text-[#DC2626] dark:text-[#F87171] border-[#FCA5A5] dark:border-[#5E2222]'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-[#10B981]' : 'bg-[#EF4444]'}`} />
                {isOnline ? '🟢 Live Data: Online' : '🔴 Live Data: Offline'}
              </span>

              <button
                onClick={() => setIsMatrixOpen(true)}
                className="px-3 py-1 bg-[#F4FAFD] hover:bg-[#E8F8FB] dark:bg-[#24181E] dark:hover:bg-[#2E1D27] text-[#123B6D] dark:text-[#FFF6EE] border border-[#CFE6EF] dark:border-[#563943] rounded-full text-xs font-bold transition flex items-center gap-1.5"
                title="View Speech Recognition & Synthesis Engines for 7 Languages"
              >
                <Globe className="w-3.5 h-3.5 text-[#1769AA]" />
                <span>Capability Matrix</span>
              </button>
            </div>
          </div>

          {/* Center Voice Cockpit Interactive Area */}
          <div className="flex flex-col items-center justify-center py-4 text-center space-y-4">
            {/* Big Touch-Friendly Microphone Button */}
            <div className="relative flex items-center justify-center">
              {/* Outer Pulsing Animation Rings when Listening */}
              {isListening && (
                <>
                  <span className="absolute w-36 h-36 rounded-full bg-[#EF4444]/20 animate-ping" />
                  <span className="absolute w-28 h-28 rounded-full bg-[#EF4444]/30 animate-pulse" />
                </>
              )}
              {isSpeaking && (
                <span className="absolute w-32 h-32 rounded-full bg-[#19B7C9]/25 animate-pulse" />
              )}
              {isThinking && (
                <span className="absolute w-32 h-32 rounded-full border-2 border-dashed border-[#1769AA] animate-spin" />
              )}

              <button
                onClick={handleMicClick}
                className={`relative z-10 w-24 h-24 rounded-full flex flex-col items-center justify-center transition-all duration-300 shadow-2xl focus:outline-none ${
                  isListening
                    ? 'bg-gradient-to-tr from-[#DC2626] to-[#EF4444] text-white scale-110 shadow-red-500/40 ring-4 ring-red-400/50'
                    : isSpeaking
                    ? 'bg-gradient-to-tr from-[#0284C7] to-[#19B7C9] text-white scale-105 shadow-cyan-500/40 ring-4 ring-cyan-400/40'
                    : isThinking
                    ? 'bg-gradient-to-tr from-[#1769AA] to-[#123B6D] text-white animate-pulse'
                    : 'bg-gradient-to-tr from-[#1769AA] to-[#168DCC] hover:from-[#123B6D] hover:to-[#1769AA] text-white hover:scale-105 shadow-blue-900/30'
                }`}
                aria-label={statusMessage}
              >
                {isListening ? (
                  <MicOff className="w-10 h-10 animate-pulse" />
                ) : isSpeaking ? (
                  <Volume2 className="w-10 h-10 animate-bounce" />
                ) : (
                  <Mic className="w-10 h-10" />
                )}
              </button>
            </div>

            {/* Dynamic Status Text & Subtitle */}
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    isListening
                      ? 'bg-[#EF4444] animate-ping'
                      : isSpeaking
                      ? 'bg-[#19B7C9] animate-pulse'
                      : isThinking
                      ? 'bg-[#E7A928] animate-spin'
                      : 'bg-[#10B981]'
                  }`}
                />
                <h3 className="text-base font-extrabold text-[#123B6D] dark:text-[#FFF6EE]">
                  {statusMessage}
                </h3>
              </div>
              <p className="text-xs text-[#55718D] dark:text-[#D4C2B6]">
                {isListening
                  ? 'Speak naturally in your local language — we will query real marine agents'
                  : 'Tap the mic or pick a quick nautical question below'}
              </p>
            </div>

            {/* Audio Playback Controls (When Response is Present) */}
            {(isSpeaking || isPaused || aiResponse) && (
              <div className="flex items-center gap-2 p-2 bg-[#F4FAFD] dark:bg-[#24181E] border border-[#D7E7F0] dark:border-[#563943] rounded-2xl shadow-sm">
                {isSpeaking ? (
                  <button
                    onClick={() => voiceSession.pauseAudio()}
                    className="p-2 text-[#123B6D] dark:text-[#FFF6EE] hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition flex items-center gap-1.5 text-xs font-bold"
                  >
                    <Pause className="w-4 h-4 text-[#E7A928]" />
                    <span>Pause</span>
                  </button>
                ) : isPaused ? (
                  <button
                    onClick={() => voiceSession.resumeAudio()}
                    className="p-2 text-[#123B6D] dark:text-[#FFF6EE] hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition flex items-center gap-1.5 text-xs font-bold"
                  >
                    <Play className="w-4 h-4 text-[#10B981]" />
                    <span>Resume</span>
                  </button>
                ) : null}

                <button
                  onClick={() => voiceSession.replayAudio()}
                  className="p-2 text-[#123B6D] dark:text-[#FFF6EE] hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition flex items-center gap-1.5 text-xs font-bold"
                >
                  <RotateCcw className="w-4 h-4 text-[#1769AA]" />
                  <span>Replay Audio</span>
                </button>

                <button
                  onClick={() => voiceSession.stopAudio()}
                  className="p-2 text-[#DC2626] hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition flex items-center gap-1.5 text-xs font-bold"
                >
                  <VolumeX className="w-4 h-4" />
                  <span>Stop</span>
                </button>
              </div>
            )}
          </div>

          {/* Transcript & AI Response Card Feed */}
          {(userTranscript || aiResponse) && (
            <div className="bg-[#F7FBFE] dark:bg-[#140C14] border border-[#D7E7F0] dark:border-[#3D2833] rounded-2xl p-4 space-y-3">
              {userTranscript && (
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-[#E8F8FB] dark:bg-[#2A1C24] text-[#1769AA] dark:text-[#E7A928] flex items-center justify-center shrink-0 text-xs font-bold">
                    🎤
                  </div>
                  <div className="flex-1">
                    <span className="text-[10px] uppercase font-mono text-[#55718D] dark:text-[#D4C2B6] font-bold">
                      You Said:
                    </span>
                    <p className="text-sm font-semibold text-[#123B6D] dark:text-[#FFF6EE]">
                      "{userTranscript}"
                    </p>
                  </div>
                </div>
              )}

              {aiResponse && (
                <div className="flex items-start gap-2.5 pt-2 border-t border-[#D7E7F0] dark:border-[#3D2833]">
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-[#1769AA] to-[#19B7C9] text-white flex items-center justify-center shrink-0 text-xs shadow-sm">
                    🤖
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-mono text-[#24A978] font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        {aiResponse.sourceCitation}
                      </span>
                      {aiResponse.dataTimestamp && (
                        <span className="text-[10px] text-[#7890A5] font-mono">
                          {aiResponse.dataTimestamp}
                        </span>
                      )}
                    </div>
                    <p className="text-xs leading-relaxed text-[#123B6D] dark:text-[#FFF6EE] whitespace-pre-line font-sans">
                      {aiResponse.text}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quick Nautical Voice Suggestions in Selected Language */}
          <div className="space-y-2 pt-2 border-t border-[#D7E7F0] dark:border-[#3D2833]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#55718D] dark:text-[#D4C2B6] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#19B7C9]" />
                Try Asking by Voice in {language.toUpperCase()}:
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {(QUICK_PROMPTS[language] || QUICK_PROMPTS.en).map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handlePromptClick(item.query)}
                  className="px-3 py-2 bg-[#F4FAFD] hover:bg-[#E8F8FB] dark:bg-[#24181E] dark:hover:bg-[#2E1D27] text-[#123B6D] dark:text-[#FFF6EE] border border-[#CFE6EF] dark:border-[#563943] rounded-xl text-xs font-semibold transition hover:scale-[1.02] shadow-sm flex items-center gap-2 group text-left"
                >
                  <span className="text-[#1769AA] group-hover:scale-110 transition">💬</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Language Capability Matrix Modal */}
      <LanguageMatrixModal
        isOpen={isMatrixOpen}
        onClose={() => setIsMatrixOpen(false)}
        activeLanguage={language}
        onSelectLanguage={(lang) => setLanguage(lang)}
      />
    </>
  );
};
