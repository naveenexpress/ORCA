import { create } from 'zustand';
import i18n from '../i18n';
import { LanguageCode, User, UserRole } from '../types';
const API_BASE = 'http://localhost:3001/api';

const DEFAULT_USER: User = {
  id: '',
  name: '',
  email: '',
  role: 'fisherman',
  isDemoAccount: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  preferredLanguage: 'en',
};

interface AuthState {
  currentUser: User;
  activeRole: UserRole;
  language: LanguageCode;
  isAuthenticated: boolean;
  token: string | null;
  isLoading: boolean;
  error: string | null;

  initAuth: () => Promise<void>;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: { name: string; email: string; password: string; phone?: string; role?: UserRole }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  switchRole: (role: UserRole) => Promise<void>;
  loginDemoUser: (role: UserRole) => Promise<void>;
  setLanguage: (lang: LanguageCode) => void;
  setUser: (user: User) => void;
  updateUserProfile: (partial: Partial<User>) => void;
  clearError: () => void;
}

const getInitialToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('orca_token');
  }
  return null;
};

const getInitialUser = (): User => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('orca_current_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.avatar && (parsed.avatar.includes('photo-1534528741775') || parsed.avatar.includes('photo-1544717305'))) {
          parsed.avatar = '/murugan-avatar.jpg';
          localStorage.setItem('orca_current_user', JSON.stringify(parsed));
        }
        return parsed;
      } catch (e) {
        // ignore parse error
      }
    }
  }
  return DEFAULT_USER;
};

const initialUser = getInitialUser();
const initialToken = getInitialToken();

export const useAuthStore = create<AuthState>((set, get) => ({
  currentUser: initialUser,
  activeRole: initialUser.role,
  language: (localStorage.getItem('orca_language') as LanguageCode) || 'en',
  isAuthenticated: !!initialToken,
  token: initialToken,
  isLoading: false,
  error: null,

  initAuth: async () => {
    const token = localStorage.getItem('orca_token');
    if (!token) return;

    set({ isLoading: true });
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          set({
            currentUser: data.user,
            activeRole: data.user.role,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
          localStorage.setItem('orca_current_user', JSON.stringify(data.user));
          return;
        }
      } else {
        localStorage.removeItem('orca_token');
        set({ token: null, isAuthenticated: false, isLoading: false });
      }
    } catch (e) {
      console.warn('[authStore] initAuth network error:', e);
      set({ isLoading: false });
    }
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        const msg = data.error || 'Invalid credentials';
        set({ isLoading: false, error: msg });
        return { success: false, error: msg };
      }

      if (data.token) {
        localStorage.setItem('orca_token', data.token);
      }
      if (data.user) {
        localStorage.setItem('orca_current_user', JSON.stringify(data.user));
      }

      set({
        currentUser: data.user,
        activeRole: data.user.role,
        token: data.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return { success: true };
    } catch (e: any) {
      const msg = e.message || 'Network error during login';
      set({ isLoading: false, error: msg });
      return { success: false, error: msg };
    }
  },

  register: async (formData) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        const msg = data.error || 'Registration failed';
        set({ isLoading: false, error: msg });
        return { success: false, error: msg };
      }

      if (data.token) {
        localStorage.setItem('orca_token', data.token);
      }
      if (data.user) {
        localStorage.setItem('orca_current_user', JSON.stringify(data.user));
      }

      set({
        currentUser: data.user,
        activeRole: data.user.role,
        token: data.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return { success: true };
    } catch (e: any) {
      const msg = e.message || 'Network error during registration';
      set({ isLoading: false, error: msg });
      return { success: false, error: msg };
    }
  },

  switchRole: async (role: UserRole) => {
    await get().loginDemoUser(role);
  },

  loginDemoUser: async (role: UserRole) => {
    const roleEmailMap: Record<string, string> = {
      fisherman: 'fisherman@orca.marine',
      disaster_authority: 'authority@orca.marine',
      researcher: 'researcher@orca.marine',
      agent: 'agent@orca.marine',
      supervisor: 'supervisor@orca.marine',
      admin: 'admin@orca.marine',
      analyst: 'analyst@orca.marine',
    };

    const email = roleEmailMap[role] || `${role}@orca.marine`;
    const res = await get().login(email, 'password123');

    if (!res.success) {
      console.warn('Failed to login demo user');
    }
  },

  setLanguage: (lang: LanguageCode) => {
    localStorage.setItem('orca_language', lang);
    i18n.changeLanguage(lang);
    set({ language: lang });
  },

  setUser: (user: User) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('orca_current_user', JSON.stringify(user));
      } catch (e) {}
    }
    set({
      currentUser: user,
      activeRole: user.role,
      isAuthenticated: true,
    });
  },

  updateUserProfile: (partial: Partial<User>) => {
    set((state) => {
      const updated = { ...state.currentUser, ...partial };
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('orca_current_user', JSON.stringify(updated));
        } catch (e) {}
      }
      return {
        currentUser: updated,
        activeRole: updated.role,
      };
    });
  },

  logout: async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, { method: 'POST' });
    } catch (e) {}
    localStorage.removeItem('orca_token');
    localStorage.removeItem('orca_current_user');
    set({
      token: null,
      isAuthenticated: false,
      error: null,
    });
  },

  clearError: () => set({ error: null }),
}));

// Initialize server-validated session on app load
useAuthStore.getState().initAuth();
