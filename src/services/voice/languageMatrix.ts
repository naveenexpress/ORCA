import { LanguageCode } from '../../types';
import { LanguageCapability } from './types';

export const LANGUAGE_LOCALE_MAP: Record<LanguageCode, string> = {
  ta: 'ta-IN',
  hi: 'hi-IN',
  te: 'te-IN',
  ml: 'ml-IN',
  kn: 'kn-IN',
  bn: 'bn-IN',
  en: 'en-IN',
};

export const LANGUAGE_CAPABILITY_MATRIX: Record<LanguageCode, LanguageCapability> = {
  ta: {
    code: 'ta',
    displayName: 'Tamil',
    nativeName: 'தமிழ்',
    localeTag: 'ta-IN',
    sttEngine: 'whisper.cpp',
    sttStatus: 'Fallback Ready',
    aiResponseStatus: 'Fully Supported',
    ttsEngine: 'Device WebSpeech',
    ttsStatus: 'Native Fallback Active',
    voiceStatus: 'Working',
    notes: 'Whisper multilingual model supported; Coqui lacks official Tamil pre-trained weights, native on-device WebSpeech synthesizer automatically active.',
  },
  hi: {
    code: 'hi',
    displayName: 'Hindi',
    nativeName: 'हिंदी',
    localeTag: 'hi-IN',
    sttEngine: 'whisper.cpp',
    sttStatus: 'Available',
    aiResponseStatus: 'Fully Supported',
    ttsEngine: 'Coqui TTS',
    ttsStatus: 'Supported',
    voiceStatus: 'Working',
    notes: 'Whisper Hindi model and Coqui multilingual XTTS/VITS supported with WebSpeech fallback.',
  },
  te: {
    code: 'te',
    displayName: 'Telugu',
    nativeName: 'తెలుగు',
    localeTag: 'te-IN',
    sttEngine: 'whisper.cpp',
    sttStatus: 'Fallback Ready',
    aiResponseStatus: 'Fully Supported',
    ttsEngine: 'Device WebSpeech',
    ttsStatus: 'Native Fallback Active',
    voiceStatus: 'Working',
    notes: 'Whisper multilingual model supported; native on-device WebSpeech synthesis active for authentic Telugu phonetics.',
  },
  ml: {
    code: 'ml',
    displayName: 'Malayalam',
    nativeName: 'മലയാളം',
    localeTag: 'ml-IN',
    sttEngine: 'whisper.cpp',
    sttStatus: 'Fallback Ready',
    aiResponseStatus: 'Fully Supported',
    ttsEngine: 'Device WebSpeech',
    ttsStatus: 'Native Fallback Active',
    voiceStatus: 'Working',
    notes: 'Whisper multilingual model supported; high-accuracy on-device Malayalam speech synthesis active.',
  },
  kn: {
    code: 'kn',
    displayName: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    localeTag: 'kn-IN',
    sttEngine: 'whisper.cpp',
    sttStatus: 'Fallback Ready',
    aiResponseStatus: 'Fully Supported',
    ttsEngine: 'Device WebSpeech',
    ttsStatus: 'Native Fallback Active',
    voiceStatus: 'Working',
    notes: 'Whisper multilingual model supported; calibrated Kannada device voice active with 0.92x cadence.',
  },
  bn: {
    code: 'bn',
    displayName: 'Bengali',
    nativeName: 'বাংলা',
    localeTag: 'bn-IN',
    sttEngine: 'whisper.cpp',
    sttStatus: 'Fallback Ready',
    aiResponseStatus: 'Fully Supported',
    ttsEngine: 'Device WebSpeech',
    ttsStatus: 'Native Fallback Active',
    voiceStatus: 'Working',
    notes: 'Whisper Bengali model supported; device speech synthesis handles Bengali Unicode phonetics seamlessly.',
  },
  en: {
    code: 'en',
    displayName: 'English',
    nativeName: 'English',
    localeTag: 'en-IN',
    sttEngine: 'whisper.cpp',
    sttStatus: 'Available',
    aiResponseStatus: 'Fully Supported',
    ttsEngine: 'Coqui TTS',
    ttsStatus: 'Supported',
    voiceStatus: 'Working',
    notes: 'Full local whisper.cpp and Coqui TTS support with on-device WebSpeech fallback.',
  },
};

/**
 * Check if local whisper.cpp HTTP server daemon is running
 */
export async function checkWhisperCppHealth(url = 'http://localhost:8080'): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200);
    const res = await fetch(`${url}/health`, { method: 'GET', signal: controller.signal });
    clearTimeout(timeoutId);
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Check if local Coqui TTS HTTP server daemon is running
 */
export async function checkCoquiTtsHealth(url = 'http://localhost:5002'): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200);
    const res = await fetch(`${url}/api/tts`, { method: 'OPTIONS', signal: controller.signal });
    clearTimeout(timeoutId);
    return res.ok;
  } catch {
    return false;
  }
}
