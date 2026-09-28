import { LanguageCode } from '../../types';

export type VoiceState =
  | 'idle'
  | 'listening'
  | 'processing'
  | 'thinking'
  | 'speaking'
  | 'paused'
  | 'error';

export interface STTResult {
  text: string;
  confidence: number;
  detectedLanguage?: LanguageCode;
  provider: 'whisper.cpp' | 'vosk' | 'webspeech';
}

export interface SpeechToTextProvider {
  name: string;
  isAvailable(): Promise<boolean>;
  startListening(
    lang: LanguageCode,
    onResult: (result: STTResult) => void,
    onError: (error: string) => void
  ): Promise<void>;
  stopListening(): Promise<void>;
  transcribeAudioBlob?(
    audioBlob: Blob,
    lang: LanguageCode
  ): Promise<STTResult>;
}

export interface TextToSpeechProvider {
  name: string;
  isAvailable(lang?: LanguageCode): Promise<boolean>;
  speak(
    text: string,
    lang: LanguageCode,
    onStart?: () => void,
    onEnd?: () => void,
    onError?: (err: any) => void
  ): Promise<void>;
  stop(): void;
  pause(): void;
  resume(): void;
}

export interface LanguageCapability {
  code: LanguageCode;
  displayName: string;
  nativeName: string;
  localeTag: string;
  sttEngine: 'whisper.cpp' | 'webspeech' | 'vosk';
  sttStatus: 'Available' | 'Fallback Ready' | 'Unavailable';
  aiResponseStatus: 'Fully Supported';
  ttsEngine: 'Coqui TTS' | 'Device WebSpeech' | 'Native System';
  ttsStatus: 'Supported' | 'Native Fallback Active';
  voiceStatus: 'Working';
  notes: string;
}
