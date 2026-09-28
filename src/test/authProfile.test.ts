import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '../store/authStore';

describe('AuthStore & Profile Editing Workflow', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('updates profile information and persists in localStorage', () => {
    const { updateUserProfile } = useAuthStore.getState();

    updateUserProfile({
      name: 'Capt. Arul Prakash',
      phone: '+91 94444 88888',
      landingCentre: 'Cuddalore Old Town Harbour',
      district: 'Cuddalore, Tamil Nadu',
      organization: 'Deep Sea Gillnetters Association',
      avatar: 'https://example.com/captain.jpg',
    });

    const updatedUser = useAuthStore.getState().currentUser;
    expect(updatedUser.name).toBe('Capt. Arul Prakash');
    expect(updatedUser.phone).toBe('+91 94444 88888');
    expect(updatedUser.landingCentre).toBe('Cuddalore Old Town Harbour');
    expect(updatedUser.district).toBe('Cuddalore, Tamil Nadu');
    expect(updatedUser.organization).toBe('Deep Sea Gillnetters Association');
    expect(updatedUser.avatar).toBe('https://example.com/captain.jpg');

    const savedInStorage = JSON.parse(localStorage.getItem('orca_current_user') || '{}');
    expect(savedInStorage.name).toBe('Capt. Arul Prakash');
    expect(savedInStorage.phone).toBe('+91 94444 88888');
  });

  it('allows updating preferred language and switches cleanly', () => {
    const { setLanguage } = useAuthStore.getState();
    setLanguage('ta');

    expect(useAuthStore.getState().language).toBe('ta');
    expect(localStorage.getItem('orca_language')).toBe('ta');
  });

  it('handles base64 uploaded photo and persists it across sessions', () => {
    const { updateUserProfile } = useAuthStore.getState();
    const fakeDataUrl = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD...';

    updateUserProfile({ avatar: fakeDataUrl });

    expect(useAuthStore.getState().currentUser.avatar).toBe(fakeDataUrl);
    const persisted = JSON.parse(localStorage.getItem('orca_current_user') || '{}');
    expect(persisted.avatar).toBe(fakeDataUrl);
  });
});
