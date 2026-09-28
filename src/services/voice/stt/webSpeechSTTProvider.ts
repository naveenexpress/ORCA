import { LanguageCode } from '../../../types';
import { SpeechToTextProvider, STTResult } from '../types';
import { LANGUAGE_LOCALE_MAP } from '../languageMatrix';

export class WebSpeechSTTProvider implements SpeechToTextProvider {
  name = 'webspeech';
  private recognition: any = null;
  private isCurrentlyListening = false;

  async isAvailable(): Promise<boolean> {
    return typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
  }

  async startListening(
    lang: LanguageCode,
    onResult: (result: STTResult) => void,
    onError: (error: string) => void
  ): Promise<void> {
    if (typeof window === 'undefined') {
      onError('Speech recognition not available in server environment');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      onError('Browser does not support SpeechRecognition');
      return;
    }

    try {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = LANGUAGE_LOCALE_MAP[lang] || 'en-IN';

      this.recognition.onresult = (event: any) => {
        const transcript = event.results[0]?.[0]?.transcript || '';
        const confidence = event.results[0]?.[0]?.confidence || 0.95;
        this.isCurrentlyListening = false;
        onResult({
          text: transcript,
          confidence,
          detectedLanguage: lang,
          provider: 'webspeech',
        });
      };

      this.recognition.onerror = (event: any) => {
        this.isCurrentlyListening = false;
        onError(event.error || 'Speech recognition error');
      };

      this.recognition.onend = () => {
        this.isCurrentlyListening = false;
      };

      this.recognition.start();
      this.isCurrentlyListening = true;
    } catch (err: any) {
      this.isCurrentlyListening = false;
      onError(err.message || 'Failed to initialize SpeechRecognition');
    }
  }

  async stopListening(): Promise<void> {
    if (this.recognition && this.isCurrentlyListening) {
      try {
        this.recognition.stop();
      } catch {}
      this.isCurrentlyListening = false;
    }
  }
}
