import { describe, it, expect, beforeEach } from 'vitest';
import i18n from '../i18n';
import { useAuthStore } from '../store/authStore';

describe('Application-wide Language Switching', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('translates navigation, profile, settings, tasks, and cases when switched to Tamil', async () => {
    const { setLanguage } = useAuthStore.getState();
    setLanguage('ta');

    expect(i18n.language).toBe('ta');
    expect(i18n.t('nav.profile')).toBe('இயக்குநர் சுயவிவரம்');
    expect(i18n.t('nav.map')).toBe('கடல் வரைபடம் (GIS)');
    expect(i18n.t('profile.title')).toBe('இயக்குநர் சுயவிவரம் & கடல்சார் அடையாளம்');
    expect(i18n.t('settings.title')).toBe('கணினி & சுயவிவர விருப்பத்தேர்வுகள்');
    expect(i18n.t('tasks.title')).toBe('களச் செயல்பாட்டுப் பணிகள்');
    expect(i18n.t('cases.title')).toBe('மீனவர் சேவை கோரிக்கைகள் & வழக்குகள்');
    expect(i18n.t('agents.title')).toBe('கடல்சார் கள முகவர்கள் அடைவு');
  });

  it('translates navigation, profile, settings, tasks, and cases when switched to Hindi', async () => {
    const { setLanguage } = useAuthStore.getState();
    setLanguage('hi');

    expect(i18n.language).toBe('hi');
    expect(i18n.t('nav.profile')).toBe('ऑपरेटर प्रोफ़ाइल');
    expect(i18n.t('nav.map')).toBe('समुद्री जीआईएस मानचित्र');
    expect(i18n.t('profile.title')).toBe('ऑपरेटर प्रोफ़ाइल एवं समुद्री पहचान');
    expect(i18n.t('settings.title')).toBe('सिस्टम और प्रोफ़ाइल प्राथमिकताएं');
    expect(i18n.t('tasks.title')).toBe('फील्ड संचालन कार्य');
    expect(i18n.t('cases.title')).toBe('मछुआरा सेवा अनुरोध और मामले');
  });

  it('translates navigation, profile, settings, tasks, and cases when switched back to English', async () => {
    const { setLanguage } = useAuthStore.getState();
    setLanguage('en');

    expect(i18n.language).toBe('en');
    expect(i18n.t('nav.profile')).toBe('Operator Profile');
    expect(i18n.t('nav.map')).toBe('Marine GIS Map');
    expect(i18n.t('profile.title')).toBe('Operator Profile & Maritime Identification');
    expect(i18n.t('settings.title')).toBe('System & Profile Preferences');
    expect(i18n.t('tasks.title')).toBe('Field Operations Tasks');
  });
});
