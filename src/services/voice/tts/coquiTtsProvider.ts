import { LanguageCode } from '../../../types';
import { TextToSpeechProvider } from '../types';
import { checkCoquiTtsHealth } from '../languageMatrix';

export class CoquiTtsProvider implements TextToSpeechProvider {
  name = 'Coqui TTS';
  private serverUrl: string;
  private currentAudio: HTMLAudioElement | null = null;

  constructor(serverUrl = 'http://localhost:5002') {
    this.serverUrl = serverUrl;
  }

  /**
   * Coqui out-of-the-box ships pre-trained XTTS models primarily for English & Hindi.
   * For other Indian regional languages, it transparently returns false to trigger native fallback.
   */
  async isAvailable(lang: LanguageCode = 'en'): Promise<boolean> {
    const isServerUp = await checkCoquiTtsHealth(this.serverUrl);
    if (!isServerUp) return false;

    // Coqui XTTS/VITS supports en & hi natively; others require custom fine-tuned weights
    return lang === 'en' || lang === 'hi';
  }

  async speak(
    text: string,
    lang: LanguageCode,
    onStart?: () => void,
    onEnd?: () => void,
    onError?: (err: any) => void
  ): Promise<void> {
    try {
      this.stop();

      const params = new URLSearchParams({
        text,
        language_idx: lang,
      });

      const res = await fetch(`${this.serverUrl}/api/tts?${params.toString()}`, {
        method: 'GET',
      });

      if (!res.ok) {
        throw new Error(`Coqui TTS failed: HTTP ${res.status}`);
      }

      const audioBlob = await res.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      this.currentAudio = new Audio(audioUrl);
      this.currentAudio.onplay = () => onStart?.();
      this.currentAudio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        this.currentAudio = null;
        onEnd?.();
      };
      this.currentAudio.onerror = (e) => {
        URL.revokeObjectURL(audioUrl);
        this.currentAudio = null;
        onError?.(e);
      };

      await this.currentAudio.play();
    } catch (err) {
      onError?.(err);
    }
  }

  stop(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
  }

  pause(): void {
    if (this.currentAudio && !this.currentAudio.paused) {
      this.currentAudio.pause();
    }
  }

  resume(): void {
    if (this.currentAudio && this.currentAudio.paused) {
      this.currentAudio.play();
    }
  }
}
