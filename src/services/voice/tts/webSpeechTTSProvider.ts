import { LanguageCode } from '../../../types';
import { TextToSpeechProvider } from '../types';
import { LANGUAGE_LOCALE_MAP } from '../languageMatrix';

export class WebSpeechTTSProvider implements TextToSpeechProvider {
  name = 'Device WebSpeech';
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  async isAvailable(_lang?: LanguageCode): Promise<boolean> {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  async speak(
    text: string,
    lang: LanguageCode,
    onStart?: () => void,
    onEnd?: () => void,
    onError?: (err: any) => void
  ): Promise<void> {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      onError?.('Speech synthesis not supported in this environment');
      return;
    }

    this.stop();

    const localeTag = LANGUAGE_LOCALE_MAP[lang] || 'en-IN';
    // Clean markdown formatting (e.g. asterisks, hashes, backticks) for smooth speech
    const cleanText = text
      .replace(/\*\*/g, '')
      .replace(/[*#`_~]/g, '')
      .replace(/•/g, '')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = localeTag;
    utterance.rate = 0.92; // Slightly reduced rate for clear nautical communication
    utterance.pitch = 1.0;

    const setVoiceAndSpeak = () => {
      const voices = window.speechSynthesis.getVoices();
      const matchedVoice =
        voices.find((v) => v.lang === localeTag) ||
        voices.find((v) => v.lang.startsWith(lang)) ||
        voices.find((v) => v.lang.includes('IN')) ||
        voices[0];

      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }

      utterance.onstart = () => onStart?.();
      utterance.onend = () => {
        this.currentUtterance = null;
        onEnd?.();
      };
      utterance.onerror = (e) => {
        this.currentUtterance = null;
        onError?.(e);
      };

      this.currentUtterance = utterance;
      window.speechSynthesis.speak(utterance);
    };

    if (window.speechSynthesis.getVoices().length > 0) {
      setVoiceAndSpeak();
    } else {
      window.speechSynthesis.onvoiceschanged = () => {
        setVoiceAndSpeak();
        window.speechSynthesis.onvoiceschanged = null;
      };
    }
  }

  stop(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      this.currentUtterance = null;
    }
  }

  pause(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.pause();
    }
  }

  resume(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.resume();
    }
  }
}
