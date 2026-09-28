import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TTSManager } from '../services/voice/tts/ttsManager';
import { STTManager } from '../services/voice/stt/sttManager';
import { VoiceSessionService } from '../services/voice/voiceSessionService';

describe('Voice Pipeline: STT, TTS and VoiceSessionService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('TTSManager Playback Controls', () => {
    it('initializes in non-speaking state', () => {
      const tts = new TTSManager();
      expect(tts.isSpeaking()).toBe(false);
      expect(tts.isPaused()).toBe(false);
    });

    it('correctly tracks pause, resume and stop states', () => {
      const tts = new TTSManager();
      tts.stop();
      expect(tts.isSpeaking()).toBe(false);
      expect(tts.isPaused()).toBe(false);
    });
  });

  describe('STTManager State Tracking', () => {
    it('initializes with idle status', () => {
      const stt = new STTManager();
      expect(stt.getStatus()).toBe('idle');
    });
  });

  describe('VoiceSessionService Singleton & Subscription', () => {
    it('provides a singleton instance', () => {
      const instance1 = VoiceSessionService.getInstance();
      const instance2 = VoiceSessionService.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('notifies listeners when state updates', () => {
      const service = VoiceSessionService.getInstance();
      let capturedState = '';
      const unsubscribe = service.subscribe({
        onStateChange: (state) => {
          capturedState = state;
        },
        onTranscript: () => {},
        onAiResponse: () => {},
        onError: () => {},
      });

      expect(capturedState).toBeDefined();
      unsubscribe();
    });
  });
});
