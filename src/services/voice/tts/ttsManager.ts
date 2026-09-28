import { LanguageCode } from '../../../types';
import { TextToSpeechProvider } from '../types';
import { CoquiTtsProvider } from './coquiTtsProvider';
import { WebSpeechTTSProvider } from './webSpeechTTSProvider';

export interface TTSManagerOptions {
  onStart?: () => void;
  onEnd?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onError?: (err: any) => void;
}

export class TTSManager {
  private coquiProvider: CoquiTtsProvider;
  private webSpeechProvider: WebSpeechTTSProvider;
  private activeProvider: TextToSpeechProvider | null = null;
  private isSpeakingState = false;
  private isPausedState = false;
  private lastText = '';
  private lastLang: LanguageCode = 'en';
  private options: TTSManagerOptions;

  constructor(options: TTSManagerOptions = {}) {
    this.options = options;
    this.coquiProvider = new CoquiTtsProvider();
    this.webSpeechProvider = new WebSpeechTTSProvider();
  }

  public isSpeaking(): boolean {
    return this.isSpeakingState;
  }

  public isPaused(): boolean {
    return this.isPausedState;
  }

  public getActiveEngineName(): string {
    return this.activeProvider?.name || 'Device WebSpeech';
  }

  /**
   * Speak response in target language, prioritizing Coqui if available, falling back to WebSpeech
   */
  public async speak(text: string, lang: LanguageCode): Promise<void> {
    this.lastText = text;
    this.lastLang = lang;
    this.stop();

    const isCoquiAvailable = await this.coquiProvider.isAvailable(lang);
    this.activeProvider = isCoquiAvailable ? this.coquiProvider : this.webSpeechProvider;

    this.isSpeakingState = true;
    this.isPausedState = false;

    await this.activeProvider.speak(
      text,
      lang,
      () => {
        this.isSpeakingState = true;
        this.isPausedState = false;
        this.options.onStart?.();
      },
      () => {
        this.isSpeakingState = false;
        this.isPausedState = false;
        this.options.onEnd?.();
      },
      (err) => {
        this.isSpeakingState = false;
        this.isPausedState = false;
        this.options.onError?.(err);
      }
    );
  }

  public pause(): void {
    if (this.activeProvider && this.isSpeakingState && !this.isPausedState) {
      this.activeProvider.pause();
      this.isPausedState = true;
      this.options.onPause?.();
    }
  }

  public resume(): void {
    if (this.activeProvider && this.isPausedState) {
      this.activeProvider.resume();
      this.isPausedState = false;
      this.options.onResume?.();
    }
  }

  public stop(): void {
    if (this.activeProvider) {
      this.activeProvider.stop();
    }
    this.coquiProvider.stop();
    this.webSpeechProvider.stop();
    this.isSpeakingState = false;
    this.isPausedState = false;
  }

  public replay(): void {
    if (this.lastText) {
      this.speak(this.lastText, this.lastLang);
    }
  }
}
