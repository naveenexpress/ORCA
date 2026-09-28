import { describe, it, expect, beforeEach } from 'vitest';
import { useThemeStore } from '../store/themeStore';

describe('Theme Store & Dynamic Theme Switching', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
    document.documentElement.dataset.theme = 'light';
  });

  it('defaults to dark mode or system resolved preference', () => {
    const { resolvedTheme } = useThemeStore.getState();
    expect(resolvedTheme).toBeDefined();
    expect(['light', 'dark']).toContain(resolvedTheme);
  });

  it('switches to Light Mode and updates documentElement and localStorage', () => {
    const { setTheme } = useThemeStore.getState();
    setTheme('light');

    const state = useThemeStore.getState();
    expect(state.theme).toBe('light');
    expect(state.resolvedTheme).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(document.documentElement.dataset.theme).toBe('light');
    expect(localStorage.getItem('orca_theme')).toBe('light');
  });

  it('switches to Dark Mode and applies dark class to documentElement', () => {
    const { setTheme } = useThemeStore.getState();
    setTheme('dark');

    const state = useThemeStore.getState();
    expect(state.theme).toBe('dark');
    expect(state.resolvedTheme).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(localStorage.getItem('orca_theme')).toBe('dark');
  });

  it('toggles smoothly between light and dark modes', () => {
    const { setTheme, toggleTheme } = useThemeStore.getState();

    setTheme('light');
    expect(useThemeStore.getState().resolvedTheme).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);

    toggleTheme();
    expect(useThemeStore.getState().resolvedTheme).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    toggleTheme();
    expect(useThemeStore.getState().resolvedTheme).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('supports system sync mode', () => {
    const { setTheme } = useThemeStore.getState();
    setTheme('system');

    const state = useThemeStore.getState();
    expect(state.theme).toBe('system');
    expect(['light', 'dark']).toContain(state.resolvedTheme);
    expect(localStorage.getItem('orca_theme')).toBe('system');
  });
});
