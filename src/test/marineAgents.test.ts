import { describe, it, expect } from 'vitest';
import { MarineAgentOrchestrator } from '../services/agents/marineAgentOrchestrator';
import { MarineWeatherAgent } from '../services/agents/marineWeatherAgent';
import { PfzAgent } from '../services/agents/pfzAgent';
import { SafetyAlertAgent } from '../services/agents/safetyAlertAgent';
import { SEED_PFZ_ADVISORIES } from '../data/seedData';
import { LiveWeatherData } from '../services/agents/types';

describe('Multi-Agent Marine Intelligence Layer', () => {
  describe('Intent Detection Across 7 Languages', () => {
    it('detects weather and sea conditions questions in Tamil', () => {
      const intent = MarineAgentOrchestrator.detectIntent('நாளைக்கு கடலுக்கு போகலாமா?');
      expect(intent).toBe('weather_sea_state');
    });

    it('detects weather questions in Hindi', () => {
      const intent = MarineAgentOrchestrator.detectIntent(
        'क्या मैं कल सुबह मछली पकड़ने के लिए समुद्र में जा सकता हूँ?'
      );
      expect(intent).toBe('weather_sea_state');
    });

    it('detects weather questions in English', () => {
      const intent = MarineAgentOrchestrator.detectIntent(
        'How are the sea conditions tomorrow morning?'
      );
      expect(intent).toBe('weather_sea_state');
    });

    it('detects weather questions in Kannada', () => {
      const intent = MarineAgentOrchestrator.detectIntent('ನಾಳೆ ಸಮುದ್ರಕ್ಕೆ ಹೋಗಲು ಸುರಕ್ಷಿತವೇ?');
      expect(intent).toBe('weather_sea_state');
    });

    it('detects weather questions in Malayalam', () => {
      const intent = MarineAgentOrchestrator.detectIntent('നാളെ കടലിൽ പോകാമോ?');
      expect(intent).toBe('weather_sea_state');
    });

    it('detects weather questions in Telugu', () => {
      const intent = MarineAgentOrchestrator.detectIntent('రేపు సముద్రంలోకి వెళ్లడం సురక్షితమేనా?');
      expect(intent).toBe('weather_sea_state');
    });

    it('detects weather questions in Bengali', () => {
      const intent = MarineAgentOrchestrator.detectIntent('কাল সকালে সমুদ্রে যাওয়া কি নিরাপদ?');
      expect(intent).toBe('weather_sea_state');
    });

    it('detects emergency SOS in Tamil, Hindi, Kannada, and English', () => {
      expect(MarineAgentOrchestrator.detectIntent('அவசரம்! காப்பாற்றுங்கள்')).toBe('emergency_sos');
      expect(MarineAgentOrchestrator.detectIntent('मदद करो, नाव में पानी भर रहा है')).toBe('emergency_sos');
      expect(MarineAgentOrchestrator.detectIntent('ತುರ್ತು ಸಹಾಯ ಬೇಕು')).toBe('emergency_sos');
      expect(MarineAgentOrchestrator.detectIntent('Mayday mayday vessel is sinking')).toBe('emergency_sos');
    });

    it('detects PFZ queries in Tamil, Hindi, Telugu, and English', () => {
      expect(MarineAgentOrchestrator.detectIntent('கಾಸிமேடு மீன்பிடி மண்டலம் எங்கே உள்ளது?')).toBe('pfz_fishing_zone');
      expect(MarineAgentOrchestrator.detectIntent('आज की सबसे अच्छी मछली पकड़ने की जगह कौन सी है?')).toBe('pfz_fishing_zone');
      expect(MarineAgentOrchestrator.detectIntent('నేటి ఉత్తమ చేపల క్షేత్రం ఏది?')).toBe('pfz_fishing_zone');
      expect(MarineAgentOrchestrator.detectIntent('Where is today\'s active PFZ with tuna?')).toBe('pfz_fishing_zone');
    });
  });

  describe('Marine Weather Agent Telemetry & Number Preservation', () => {
    const mockTelemetry: LiveWeatherData = {
      temp: 29,
      feelsLike: 33,
      humidity: 78,
      pressure: 1011,
      windSpeedKnots: 12.5,
      windSpeedKmh: 23.2,
      windDeg: 210,
      windCardinal: 'SSW',
      visibilityKm: 10,
      visibilityNm: 5.4,
      description: 'Scattered clouds',
      icon: '03d',
      waveEstimate: '1.1 — 1.4 m (Slight Swell)',
      seaStatus: 'SAFE TO VENTURE',
      seaStatusColor: 'text-green-600',
      city: 'Kasimedu Fishing Harbour',
      lastUpdated: '10:30 AM',
      isLiveData: true,
    };

    it('formats weather response in Tamil preserving exact numbers', () => {
      const formatted = MarineWeatherAgent.formatWeatherResponse(mockTelemetry, 'ta');
      expect(formatted).toContain('12.5 knots');
      expect(formatted).toContain('29°C');
      expect(formatted).toContain('1.1 — 1.4 m');
      expect(formatted).toContain('கடலுக்கு செல்ல பாதுகாப்பானது');
    });

    it('formats weather response in Hindi preserving exact numbers', () => {
      const formatted = MarineWeatherAgent.formatWeatherResponse(mockTelemetry, 'hi');
      expect(formatted).toContain('12.5 नॉट');
      expect(formatted).toContain('29°C');
      expect(formatted).toContain('समुद्र में जाना सुरक्षित है');
    });

    it('formats weather response in Kannada preserving exact numbers', () => {
      const formatted = MarineWeatherAgent.formatWeatherResponse(mockTelemetry, 'kn');
      expect(formatted).toContain('12.5 ನಾಟ್ಸ್');
      expect(formatted).toContain('29°C');
      expect(formatted).toContain('ಸಮುದ್ರಕ್ಕೆ ಹೋಗಲು ಸುರಕ್ಷಿತವಾಗಿದೆ');
    });

    it('returns honest offline notice if live telemetry is unavailable', () => {
      const taOffline = MarineWeatherAgent.formatWeatherResponse(null, 'ta');
      expect(taOffline).toContain('தற்போதைய கடல் நிலைத் தரவைப் பெற தேவையான');

      const hiOffline = MarineWeatherAgent.formatWeatherResponse(null, 'hi');
      expect(hiOffline).toContain('वर्तमान मौसम और समुद्री स्थिति डेटा प्राप्त करने के लिए सेवा उपलब्ध नहीं है');

      const knOffline = MarineWeatherAgent.formatWeatherResponse(null, 'kn');
      expect(knOffline).toContain('ಪ್ರಸ್ತುತ ಸಾಗರ ಹವಾಮಾನ ಮಾಹಿತಿ ಪಡೆಯಲು ಲೈವ್ ಸರ್ವರ್ ಲಭ್ಯವಿಲ್ಲ');
    });
  });

  describe('PFZ Agent Numerical Accuracy', () => {
    const advisory = SEED_PFZ_ADVISORIES[0];

    it('formats PFZ details in Tamil without modifying depth or bearings', () => {
      const res = PfzAgent.formatPfzResponse(advisory, 'ta');
      expect(res).toContain(`${advisory.depth} மீட்டர்`);
      expect(res).toContain(`${advisory.bearingDegrees}°`);
      expect(res).toContain(`${advisory.distanceKm} கி.மீ`);
      expect(res).toContain(`${advisory.seaSurfaceTemperature}°C`);
      expect(res).toContain(`${advisory.chlorophyll} mg/m³`);
    });

    it('formats PFZ details in Kannada without modifying depth or bearings', () => {
      const res = PfzAgent.formatPfzResponse(advisory, 'kn');
      expect(res).toContain(`${advisory.depth} ಮೀಟರ್`);
      expect(res).toContain(`${advisory.bearingDegrees}°`);
      expect(res).toContain(`${advisory.distanceKm} ಕಿ.ಮೀ`);
      expect(res).toContain(`${advisory.seaSurfaceTemperature}°C`);
    });
  });

  describe('Safety Alert Agent Emergency Protocols', () => {
    it('contains Coast Guard 1554 hotline across all languages', () => {
      expect(SafetyAlertAgent.formatEmergencyResponse('ta')).toContain('1554');
      expect(SafetyAlertAgent.formatEmergencyResponse('hi')).toContain('1554');
      expect(SafetyAlertAgent.formatEmergencyResponse('kn')).toContain('1554');
      expect(SafetyAlertAgent.formatEmergencyResponse('te')).toContain('1554');
      expect(SafetyAlertAgent.formatEmergencyResponse('ml')).toContain('1554');
      expect(SafetyAlertAgent.formatEmergencyResponse('bn')).toContain('1554');
      expect(SafetyAlertAgent.formatEmergencyResponse('en')).toContain('1554');
    });
  });
});
