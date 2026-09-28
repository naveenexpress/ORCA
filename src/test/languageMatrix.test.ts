import { describe, it, expect } from 'vitest';
import { LANGUAGE_CAPABILITY_MATRIX, LANGUAGE_LOCALE_MAP } from '../services/voice/languageMatrix';
import { LanguageCode } from '../types';

describe('Language Capability Matrix & 7-Language Verification', () => {
  const REQUIRED_LANGUAGES: LanguageCode[] = ['ta', 'hi', 'te', 'ml', 'kn', 'bn', 'en'];

  it('contains entries for all 7 required languages', () => {
    REQUIRED_LANGUAGES.forEach((lang) => {
      const entry = LANGUAGE_CAPABILITY_MATRIX[lang];
      expect(entry).toBeDefined();
      expect(entry.code).toBe(lang);
      expect(entry.voiceStatus).toBe('Working');
      expect(entry.aiResponseStatus).toBe('Fully Supported');
      expect(entry.sttEngine).toBeDefined();
      expect(entry.ttsEngine).toBeDefined();
    });
  });

  it('correctly maps locale codes for Speech Recognition & Synthesis', () => {
    expect(LANGUAGE_LOCALE_MAP.ta).toBe('ta-IN');
    expect(LANGUAGE_LOCALE_MAP.hi).toBe('hi-IN');
    expect(LANGUAGE_LOCALE_MAP.te).toBe('te-IN');
    expect(LANGUAGE_LOCALE_MAP.ml).toBe('ml-IN');
    expect(LANGUAGE_LOCALE_MAP.kn).toBe('kn-IN');
    expect(LANGUAGE_LOCALE_MAP.bn).toBe('bn-IN');
    expect(LANGUAGE_LOCALE_MAP.en).toBe('en-IN');
  });

  it('honestly documents TTS engine fallbacks for Indian regional languages', () => {
    // Coqui XTTS/VITS ships English & Hindi models; other Indian regional languages use native on-device WebSpeech
    expect(LANGUAGE_CAPABILITY_MATRIX.en.ttsEngine).toBe('Coqui TTS');
    expect(LANGUAGE_CAPABILITY_MATRIX.hi.ttsEngine).toBe('Coqui TTS');
    expect(LANGUAGE_CAPABILITY_MATRIX.ta.ttsEngine).toBe('Device WebSpeech');
    expect(LANGUAGE_CAPABILITY_MATRIX.te.ttsEngine).toBe('Device WebSpeech');
    expect(LANGUAGE_CAPABILITY_MATRIX.ml.ttsEngine).toBe('Device WebSpeech');
    expect(LANGUAGE_CAPABILITY_MATRIX.kn.ttsEngine).toBe('Device WebSpeech');
    expect(LANGUAGE_CAPABILITY_MATRIX.bn.ttsEngine).toBe('Device WebSpeech');
  });
});
