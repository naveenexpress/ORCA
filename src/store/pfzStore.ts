import { create } from 'zustand';
import { ConfidenceLevel, PfzAdvisory, PfzStatus } from '../types';
import { SEED_LANDING_CENTRES } from '../data/seedData';
const API_BASE = 'http://localhost:3001/api';

/**
 * Prisma stores polygonCoordinates, targetSpecies, languageVariants as Json.
 * The shape is already correct when returned from the API; we just need to
 * ensure arrays/objects are never null so downstream rendering doesn't break.
 */
function normalisePfz(raw: any): PfzAdvisory {
  return {
    ...raw,
    polygonCoordinates: raw.polygonCoordinates ?? [],
    targetSpecies: raw.targetSpecies ?? [],
    languageVariants: raw.languageVariants ?? undefined,
  } as PfzAdvisory;
}

interface PfzState {
  advisories: PfzAdvisory[];
  landingCentres: typeof SEED_LANDING_CENTRES;
  selectedAdvisory: PfzAdvisory | null;
  searchQuery: string;
  selectedLandingCentre: string;
  selectedConfidence: ConfidenceLevel | 'ALL';
  showExpired: boolean;
  bookmarkedIds: string[];
  isLoading: boolean;
  error: string | null;

  // ── READ ──────────────────────────────────────────────────────────────────
  fetchAdvisories: () => Promise<void>;

  // ── WRITE ─────────────────────────────────────────────────────────────────
  createAdvisory: (data: Omit<PfzAdvisory, 'id'>) => Promise<PfzAdvisory | null>;
  updateAdvisory: (id: string, data: Partial<PfzAdvisory>) => Promise<PfzAdvisory | null>;
  deleteAdvisory: (id: string) => Promise<boolean>;
  clearError: () => void;

  // ── EXISTING UI operations (preserved unchanged) ──────────────────────────
  setSelectedAdvisory: (adv: PfzAdvisory | null) => void;
  setSearchQuery: (query: string) => void;
  setSelectedLandingCentre: (id: string) => void;
  setSelectedConfidence: (conf: ConfidenceLevel | 'ALL') => void;
  setShowExpired: (show: boolean) => void;
  toggleBookmark: (id: string) => void;
  /** @deprecated use createAdvisory — kept for backwards compat */
  addAdvisory: (advisory: PfzAdvisory) => void;
  updateAdvisoryStatus: (id: string, status: PfzStatus) => void;
}

export const usePfzStore = create<PfzState>((set, get) => ({
  // Warm-start so the map / explorer page never shows an empty list while the
  // async DB fetch is in flight.
  advisories: [],
  // Landing centres are static reference data (no Prisma model) — keep as seed.
  landingCentres: SEED_LANDING_CENTRES,
  selectedAdvisory: null,
  searchQuery: '',
  selectedLandingCentre: 'ALL',
  selectedConfidence: 'ALL',
  showExpired: false,
  bookmarkedIds: ['pfz-adv-2026-01'],
  isLoading: false,
  error: null,

  // ── READ ──────────────────────────────────────────────────────────────────
  fetchAdvisories: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API_BASE}/pfz`);
      if (!res.ok) throw new Error(`Server responded ${res.status}`);
      const raw: any[] = await res.json();
      const advisories = raw.map(normalisePfz);
      set({
        advisories: advisories,
        selectedAdvisory: advisories.length > 0 ? advisories[0] : null,
        isLoading: false,
      });
    } catch (e: any) {
      console.warn('[pfzStore] fetchAdvisories failed:', e.message);
      set({ advisories: [], selectedAdvisory: null, isLoading: false, error: null });
    }
  },

  // ── CREATE ────────────────────────────────────────────────────────────────
  createAdvisory: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API_BASE}/pfz`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.status === 409) {
        const body = await res.json();
        set({ isLoading: false, error: body.error || 'Duplicate advisoryId' });
        return null;
      }
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || `Server error ${res.status}`);
      }
      const created = normalisePfz(await res.json());
      set((state) => ({
        advisories: [created, ...state.advisories],
        selectedAdvisory: created,
        isLoading: false,
      }));
      return created;
    } catch (e: any) {
      console.error('[pfzStore] createAdvisory error:', e);
      set({ isLoading: false, error: e.message || 'Failed to create advisory' });
      return null;
    }
  },

  // ── UPDATE ────────────────────────────────────────────────────────────────
  updateAdvisory: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const current = get().advisories.find((a) => a.id === id);
      if (!current) {
        set({ isLoading: false, error: 'Advisory not found locally' });
        return null;
      }
      const res = await fetch(`${API_BASE}/pfz/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...current, ...data }),
      });
      if (res.status === 404) {
        set({ isLoading: false, error: 'Advisory not found in database' });
        return null;
      }
      if (res.status === 409) {
        const body = await res.json();
        set({ isLoading: false, error: body.error || 'Duplicate advisoryId' });
        return null;
      }
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || `Server error ${res.status}`);
      }
      const updated = normalisePfz(await res.json());
      set((state) => ({
        advisories: state.advisories.map((a) => (a.id === id ? updated : a)),
        selectedAdvisory: state.selectedAdvisory?.id === id ? updated : state.selectedAdvisory,
        isLoading: false,
      }));
      return updated;
    } catch (e: any) {
      console.error('[pfzStore] updateAdvisory error:', e);
      set({ isLoading: false, error: e.message || 'Failed to update advisory' });
      return null;
    }
  },

  // ── DELETE ────────────────────────────────────────────────────────────────
  deleteAdvisory: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API_BASE}/pfz/${id}`, { method: 'DELETE' });
      if (res.status === 404) {
        set((state) => ({
          advisories: state.advisories.filter((a) => a.id !== id),
          selectedAdvisory: state.selectedAdvisory?.id === id ? null : state.selectedAdvisory,
          isLoading: false,
        }));
        return true;
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Server error ${res.status}`);
      }
      set((state) => ({
        advisories: state.advisories.filter((a) => a.id !== id),
        selectedAdvisory: state.selectedAdvisory?.id === id ? null : state.selectedAdvisory,
        isLoading: false,
      }));
      return true;
    } catch (e: any) {
      console.error('[pfzStore] deleteAdvisory error:', e);
      set({ isLoading: false, error: e.message || 'Failed to delete advisory' });
      return false;
    }
  },

  clearError: () => set({ error: null }),

  // ── EXISTING UI operations — preserved exactly ────────────────────────────

  setSelectedAdvisory: (adv) => set({ selectedAdvisory: adv }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSelectedLandingCentre: (selectedLandingCentre) => set({ selectedLandingCentre }),
  setSelectedConfidence: (selectedConfidence) => set({ selectedConfidence }),
  setShowExpired: (showExpired) => set({ showExpired }),

  toggleBookmark: (id) =>
    set((state) => ({
      bookmarkedIds: state.bookmarkedIds.includes(id)
        ? state.bookmarkedIds.filter((bId) => bId !== id)
        : [...state.bookmarkedIds, id],
    })),

  /** @deprecated — use createAdvisory for DB persistence */
  addAdvisory: (advisory) =>
    set((state) => ({
      advisories: [advisory, ...state.advisories],
    })),

  updateAdvisoryStatus: (id, status) =>
    set((state) => ({
      advisories: state.advisories.map((a) =>
        a.id === id ? { ...a, status, updatedAt: new Date().toISOString() } : a
      ),
      selectedAdvisory:
        state.selectedAdvisory?.id === id
          ? { ...state.selectedAdvisory, status, updatedAt: new Date().toISOString() }
          : state.selectedAdvisory,
    })),
}));

// Kick off the DB fetch immediately when the module loads.
usePfzStore.getState().fetchAdvisories();
