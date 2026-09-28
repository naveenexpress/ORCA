import { LanguageCode } from '../../../types';
import { SpeechToTextProvider, STTResult } from '../types';

export class VoskProvider implements SpeechToTextProvider {
  name = 'vosk';
  private serverUrl: string;

  constructor(serverUrl = 'http://localhost:2700') {
    this.serverUrl = serverUrl;
  }

  async isAvailable(): Promise<boolean> {
    try {
      const res = await fetch(`${this.serverUrl}/status`, { method: 'GET' });
      return res.ok;
    } catch {
      return false;
    }
  }

  async startListening(
    _lang: LanguageCode,
    _onResult: (result: STTResult) => void,
    onError: (error: string) => void
  ): Promise<void> {
    onError('Vosk provider uses transcribeAudioBlob interface');
  }

  async stopListening(): Promise<void> {
    // No-op
  }

  async transcribeAudioBlob(audioBlob: Blob, lang: LanguageCode): Promise<STTResult> {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'speech.wav');
    formData.append('lang', lang);

    const res = await fetch(`${this.serverUrl}/asr`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      throw new Error(`Vosk transcription failed: HTTP ${res.status}`);
    }

    const data = await res.json();
    return {
      text: (data.text || '').trim(),
      confidence: 0.90,
      detectedLanguage: lang,
      provider: 'vosk',
    };
  }
}
