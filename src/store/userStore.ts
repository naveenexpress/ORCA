import { create } from 'zustand';
import { User, UserRole, LanguageCode } from '../types';

const API_BASE = 'http://localhost:3001/api';

export type UserFormData = {
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  organization?: string;
  assignedRegion?: string;
  district?: string;
  landingCentre?: string;
  baseLocationName?: string;
  preferredLanguage: LanguageCode;
  avatar?: string;
  isDemoAccount?: boolean;
};

interface UserState {
  users: User[];
  isLoading: boolean;
  error: string | null;

  fetchUsers: () => Promise<void>;
  createUser: (data: UserFormData) => Promise<User | null>;
  updateUser: (id: string, data: Partial<UserFormData>) => Promise<User | null>;
  deleteUser: (id: string) => Promise<boolean>;
  clearError: () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  users: [],
  isLoading: false,
  error: null,

  // ─── READ ─────────────────────────────────────────────────────────────────
  fetchUsers: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API_BASE}/users`);
      if (!res.ok) throw new Error(`Server responded ${res.status}`);
      const data: User[] = await res.json();
      set({ users: data, isLoading: false });
    } catch (e: any) {
      console.error('[userStore] fetchUsers error:', e.message);
      set({ users: [], isLoading: false, error: e.message });
    }
  },

  // ─── CREATE ───────────────────────────────────────────────────────────────
  createUser: async (data: UserFormData) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API_BASE}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.status === 409) {
        const body = await res.json();
        set({ isLoading: false, error: body.error || 'Email already in use' });
        return null;
      }
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || `Server error ${res.status}`);
      }

      const created: User = await res.json();
      set((state) => ({
        users: [created, ...state.users],
        isLoading: false,
      }));
      return created;
    } catch (e: any) {
      console.error('[userStore] createUser error:', e);
      set({ isLoading: false, error: e.message || 'Failed to create user' });
      return null;
    }
  },

  // ─── UPDATE ───────────────────────────────────────────────────────────────
  updateUser: async (id: string, data: Partial<UserFormData>) => {
    set({ isLoading: true, error: null });
    try {
      // Optimistically find current record so we can merge
      const current = get().users.find((u) => u.id === id);
      if (!current) {
        set({ isLoading: false, error: 'User not found locally' });
        return null;
      }

      const res = await fetch(`${API_BASE}/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...current, ...data }),
      });

      if (res.status === 404) {
        set({ isLoading: false, error: 'User not found in database' });
        return null;
      }
      if (res.status === 409) {
        const body = await res.json();
        set({ isLoading: false, error: body.error || 'Email already in use' });
        return null;
      }
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || `Server error ${res.status}`);
      }

      const updated: User = await res.json();
      set((state) => ({
        users: state.users.map((u) => (u.id === id ? updated : u)),
        isLoading: false,
      }));
      return updated;
    } catch (e: any) {
      console.error('[userStore] updateUser error:', e);
      set({ isLoading: false, error: e.message || 'Failed to update user' });
      return null;
    }
  },

  // ─── DELETE ───────────────────────────────────────────────────────────────
  deleteUser: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API_BASE}/users/${id}`, { method: 'DELETE' });

      if (res.status === 404) {
        // Already gone — remove from local list anyway
        set((state) => ({
          users: state.users.filter((u) => u.id !== id),
          isLoading: false,
        }));
        return true;
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Server error ${res.status}`);
      }

      set((state) => ({
        users: state.users.filter((u) => u.id !== id),
        isLoading: false,
      }));
      return true;
    } catch (e: any) {
      console.error('[userStore] deleteUser error:', e);
      set({ isLoading: false, error: e.message || 'Failed to delete user' });
      return false;
    }
  },

  clearError: () => set({ error: null }),
}));

// Kick off the initial DB fetch as soon as the module is imported.
useUserStore.getState().fetchUsers();
