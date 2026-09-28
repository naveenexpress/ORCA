import { LanguageCode } from '../../../types';
import { SpeechToTextProvider, STTResult } from '../types';
import { WhisperCppProvider } from './whisperCppProvider';
import { WebSpeechSTTProvider } from './webSpeechSTTProvider';

export type STTStatusState =
  | 'idle'
  | 'listening'
  | 'processing'
  | 'success'
  | 'error';

export interface STTManagerOptions {
  onStatusChange?: (status: STTStatusState, message?: string) => void;
  onResult?: (result: STTResult) => void;
  onError?: (errorMessage: string) => void;
}

export class STTManager {
  private whisperProvider: WhisperCppProvider;
  private webSpeechProvider: WebSpeechSTTProvider;
  private activeProvider: SpeechToTextProvider | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private status: STTStatusState = 'idle';
  private options: STTManagerOptions;

  constructor(options: STTManagerOptions = {}) {
    this.options = options;
    this.whisperProvider = new WhisperCppProvider();
    this.webSpeechProvider = new WebSpeechSTTProvider();
  }

  public getStatus(): STTStatusState {
    return this.status;
  }

  private setStatus(status: STTStatusState, message?: string) {
    this.status = status;
    if (this.options.onStatusChange) {
      this.options.onStatusChange(status, message);
    }
  }

  /**
   * Request microphone permission and start speech capture in the selected language
   */
  public async startListening(lang: LanguageCode): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      this.setStatus('listening', 'Listening...');

      // 1. Detect if local whisper.cpp server is running
      const isWhisperAvailable = await this.whisperProvider.isAvailable();

      if (isWhisperAvailable) {
        // Run local whisper.cpp audio recording pipeline
        this.activeProvider = this.whisperProvider;
        this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        this.audioChunks = [];
        this.mediaRecorder = new MediaRecorder(this.stream);

        this.mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) this.audioChunks.push(e.data);
        };

        this.mediaRecorder.onstop = async () => {
          this.setStatus('processing', 'Processing...');
          const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
          try {
            const result = await this.whisperProvider.transcribeAudioBlob(audioBlob, lang);
            if (result.text.trim()) {
              this.setStatus('success', `You said: "${result.text}"`);
              if (this.options.onResult) this.options.onResult(result);
            } else {
              this.setStatus('error', 'Could not understand. Please try again.');
              if (this.options.onError) this.options.onError('No speech detected');
            }
          } catch (err: any) {
            // If whisper failed mid-inference, fall back to WebSpeech
            this.fallbackToWebSpeech(lang);
          } finally {
            this.cleanupStream();
          }
        };

        this.mediaRecorder.start();
      } else {
        // Fallback to local on-device WebSpeech STT
        this.activeProvider = this.webSpeechProvider;
        await this.webSpeechProvider.startListening(
          lang,
          (result) => {
            if (result.text.trim()) {
              this.setStatus('success', `You said: "${result.text}"`);
              if (this.options.onResult) this.options.onResult(result);
            } else {
              this.setStatus('error', 'Could not understand. Please try again.');
              if (this.options.onError) this.options.onError('No speech detected');
            }
          },
          (error) => {
            this.setStatus('error', 'Could not understand. Please try again.');
            if (this.options.onError) this.options.onError(error);
          }
        );
      }
    } catch (err: any) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        this.setStatus('error', 'Microphone permission denied. Please allow microphone access in your browser.');
      } else {
        this.setStatus('error', 'Microphone unavailable. Please try again.');
      }
      if (this.options.onError) this.options.onError(err.message || 'Microphone error');
    }
  }

  private async fallbackToWebSpeech(lang: LanguageCode) {
    this.activeProvider = this.webSpeechProvider;
    await this.webSpeechProvider.startListening(
      lang,
      (res) => {
        this.setStatus('success', `You said: "${res.text}"`);
        if (this.options.onResult) this.options.onResult(res);
      },
      (err) => {
        this.setStatus('error', 'Could not understand. Please try again.');
        if (this.options.onError) this.options.onError(err);
      }
    );
  }

  /**
   * Stop active speech capture
   */
  public async stopListening(): Promise<void> {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    } else if (this.activeProvider) {
      await this.activeProvider.stopListening();
    }
    this.cleanupStream();
  }

  private cleanupStream() {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
  }
}
