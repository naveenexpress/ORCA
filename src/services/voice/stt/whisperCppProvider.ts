import { LanguageCode } from '../../../types';
import { SpeechToTextProvider, STTResult } from '../types';
import { checkWhisperCppHealth } from '../languageMatrix';

export class WhisperCppProvider implements SpeechToTextProvider {
  name = 'whisper.cpp';
  private serverUrl: string;

  constructor(serverUrl = 'http://localhost:8080') {
    this.serverUrl = serverUrl;
  }

  async isAvailable(): Promise<boolean> {
    return checkWhisperCppHealth(this.serverUrl);
  }

  async startListening(
    _lang: LanguageCode,
    _onResult: (result: STTResult) => void,
    onError: (error: string) => void
  ): Promise<void> {
    // whisper.cpp operates via HTTP audio buffer/inference endpoint
    onError('whisper.cpp uses audio blob inference via transcribeAudioBlob');
  }

  async stopListening(): Promise<void> {
    // No-op for HTTP endpoint
  }

  /**
   * Transcribe recorded audio buffer via local whisper.cpp server
   */
  async transcribeAudioBlob(audioBlob: Blob, lang: LanguageCode): Promise<STTResult> {
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.wav');
    formData.append('language', lang);
    formData.append('response_format', 'json');

    const res = await fetch(`${this.serverUrl}/inference`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      throw new Error(`whisper.cpp inference failed with HTTP ${res.status}`);
    }

    const data = await res.json();
    return {
      text: (data.text || '').trim(),
      confidence: 0.95,
      detectedLanguage: lang,
      provider: 'whisper.cpp',
    };
  }
}
