import { LanguageCode } from '../../types';
import { useChatStore } from '../../store/chatStore';
import { MarineAgentOrchestrator } from '../agents/marineAgentOrchestrator';
import { AgentQueryResult } from '../agents/types';
import { STTManager, STTStatusState } from './stt/sttManager';
import { TTSManager } from './tts/ttsManager';
import { VoiceState } from './types';

export interface VoiceSessionListener {
  onStateChange: (state: VoiceState, statusText: string) => void;
  onTranscript: (transcript: string) => void;
  onAiResponse: (response: AgentQueryResult) => void;
  onError: (errorMessage: string) => void;
}

export class VoiceSessionService {
  private static instance: VoiceSessionService | null = null;
  private sttManager: STTManager;
  private ttsManager: TTSManager;
  private currentState: VoiceState = 'idle';
  private currentLanguage: LanguageCode = 'en';
  private listeners: Set<VoiceSessionListener> = new Set();
  private lastAiResponse: AgentQueryResult | null = null;

  private constructor() {
    this.sttManager = new STTManager({
      onStatusChange: (status, message) => this.handleSttStatusChange(status, message),
      onResult: (result) => this.handleSttResult(result.text),
      onError: (err) => this.handleError(err),
    });

    this.ttsManager = new TTSManager({
      onStart: () => this.setState('speaking', 'Playing response...'),
      onEnd: () => this.setState('idle', 'Tap to speak'),
      onPause: () => this.setState('paused', 'Paused'),
      onResume: () => this.setState('speaking', 'Playing response...'),
      onError: (err) => {
        console.warn('TTS Playback warning:', err);
        this.setState('idle', 'Tap to speak');
      },
    });
  }

  public static getInstance(): VoiceSessionService {
    if (!this.instance) {
      this.instance = new VoiceSessionService();
    }
    return this.instance;
  }

  public subscribe(listener: VoiceSessionListener): () => void {
    this.listeners.add(listener);
    // Initial notification
    listener.onStateChange(this.currentState, this.getStatusMessageForState(this.currentState));
    return () => this.listeners.delete(listener);
  }

  public getState(): VoiceState {
    return this.currentState;
  }

  public getLastResponse(): AgentQueryResult | null {
    return this.lastAiResponse;
  }

  public getTTSManager(): TTSManager {
    return this.ttsManager;
  }

  public setLanguage(lang: LanguageCode) {
    this.currentLanguage = lang;
  }

  /**
   * Start Voice Session (Microphone -> STT)
   */
  public async startSession(lang: LanguageCode = this.currentLanguage): Promise<void> {
    this.currentLanguage = lang;
    this.ttsManager.stop();
    this.setState('listening', 'Listening...');
    await this.sttManager.startListening(lang);
  }

  /**
   * Stop speech listening
   */
  public async stopSession(): Promise<void> {
    if (this.currentState === 'listening') {
      await this.sttManager.stopListening();
    }
  }

  /**
   * Pause/Resume Audio
   */
  public pauseAudio(): void {
    this.ttsManager.pause();
  }

  public resumeAudio(): void {
    this.ttsManager.resume();
  }

  public stopAudio(): void {
    this.ttsManager.stop();
    this.setState('idle', 'Tap to speak');
  }

  public replayAudio(): void {
    if (this.lastAiResponse) {
      this.setState('speaking', 'Playing response...');
      this.ttsManager.speak(this.lastAiResponse.text, this.currentLanguage);
    }
  }

  private handleSttStatusChange(status: STTStatusState, message?: string) {
    switch (status) {
      case 'listening':
        this.setState('listening', message || 'Listening...');
        break;
      case 'processing':
        this.setState('processing', message || 'Understanding...');
        break;
      case 'error':
        this.setState('error', message || 'Could not understand. Please try again.');
        break;
      case 'idle':
        this.setState('idle', 'Tap to speak');
        break;
    }
  }

  /**
   * Connects transcribed user text into the existing AI multi-agent system and chat store
   */
  private async handleSttResult(transcript: string) {
    if (!transcript.trim()) {
      this.setState('error', 'Could not understand. Please try again.');
      return;
    }

    // 1. Notify listeners of user transcript
    this.listeners.forEach((l) => l.onTranscript(transcript));
    this.setState('thinking', 'Checking marine information...');

    // 2. Synchronize with existing AI chat store
    const chatStore = useChatStore.getState();
    chatStore.sendMessage(transcript, this.currentLanguage);

    try {
      // 3. Process via Marine Multi-Agent Orchestrator
      const aiResponse = await MarineAgentOrchestrator.processMarineQuery(
        transcript,
        this.currentLanguage
      );

      this.lastAiResponse = aiResponse;
      this.listeners.forEach((l) => l.onAiResponse(aiResponse));

      // 4. Convert AI response into natural speech via TTS
      this.setState('speaking', 'Preparing audio...');
      await this.ttsManager.speak(aiResponse.text, this.currentLanguage);
    } catch (err: any) {
      console.error('Multi-Agent reasoning error:', err);
      this.handleError('Could not process marine request. Please try again.');
    }
  }

  private handleError(message: string) {
    this.setState('error', message);
    this.listeners.forEach((l) => l.onError(message));
  }

  private setState(state: VoiceState, statusText: string) {
    this.currentState = state;
    this.listeners.forEach((l) => l.onStateChange(state, statusText));
  }

  private getStatusMessageForState(state: VoiceState): string {
    switch (state) {
      case 'listening':
        return 'Listening...';
      case 'processing':
        return 'Understanding...';
      case 'thinking':
        return 'Checking marine information...';
      case 'speaking':
        return 'Playing response...';
      case 'paused':
        return 'Paused';
      case 'error':
        return 'Could not understand. Please try again.';
      case 'idle':
      default:
        return 'Tap to speak';
    }
  }
}
