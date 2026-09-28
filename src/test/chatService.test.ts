import { describe, expect, it, vi, beforeAll, afterAll } from 'vitest';
import { processUserChatQuery } from '../services/chatService';
import { SEED_PFZ_ADVISORIES } from '../data/seedData';

describe('ORCA AI Chatbot Intent Processor & Location Resolution', () => {
  const originalFetch = globalThis.fetch;

  beforeAll(() => {
    globalThis.fetch = vi.fn().mockImplementation(async (url: any) => {
      const urlString = url.toString();
      if (urlString.includes('/api/weather')) {
        return {
          ok: true,
          json: async () => ({
            coord: { lon: 83.218, lat: 17.686 },
            weather: [{ main: 'Clear', description: 'clear sky' }],
            main: { temp: 28, humidity: 80, pressure: 1010 },
            wind: { speed: 5, deg: 180 }
          })
        };
      }
      return { ok: true, json: async () => ({}) };
    });
  });

  afterAll(() => {
    globalThis.fetch = originalFetch;
  });
  it('detects SOS emergency intents with highest priority', async () => {
    const res = await processUserChatQuery('Help our boat is sinking emergency SOS', 'en', SEED_PFZ_ADVISORIES);
    expect(res.text).toContain('Maritime Emergency Protocol');
    expect(res.sourceCitation).toContain('Coast Guard');
    expect(res.cardPreview?.type).toBe('sos');
  });

  it('answers PFZ advisory questions with verified INCOIS citations', async () => {
    const res = await processUserChatQuery('Where is today fishing zone near Kasimedu?', 'en', SEED_PFZ_ADVISORIES);
    expect(res.text).toContain('Potential Fishing Zone');
    expect(res.isVerifiedData).toBe(true);
    expect(res.sourceCitation).toContain('INCOIS');
    expect(res.cardPreview?.type).toBe('pfz');
  });

  it('resolves location dynamically for Visakhapatnam (Vizag)', async () => {
    const res = await processUserChatQuery('What is the weather and wave height in Vizag?', 'en', SEED_PFZ_ADVISORIES);
    expect(res.text).toContain('Visakhapatnam (Vizag)');
    expect(res.cardPreview?.type).toBe('weather');
  });

  it('resolves location dynamically for Cochin (Kochi)', async () => {
    const res = await processUserChatQuery('Is it safe to go fishing in Cochin tomorrow?', 'en', SEED_PFZ_ADVISORIES);
    expect(res.text).toContain('Cochin (Kochi)');
    expect(res.cardPreview?.type).toBe('weather');
  });

  it('resolves location dynamically for Tuticorin (Thoothukudi)', async () => {
    const res = await processUserChatQuery('Show PFZ fishing zone near Tuticorin', 'en', SEED_PFZ_ADVISORIES);
    expect(res.text).toContain('Tuticorin');
    expect(res.cardPreview?.type).toBe('pfz');
  });

  it('handles multilingual queries in Tamil', async () => {
    const res = await processUserChatQuery('மீன்பிடி மண்டலம் எங்கே உள்ளது?', 'ta', SEED_PFZ_ADVISORIES);
    expect(res.text).toContain('PFZ');
    expect(res.isVerifiedData).toBe(true);
  });
});
