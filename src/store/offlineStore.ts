import { create } from 'zustand';

export interface PendingMutation {
  id: string;
  type: 'UPDATE_TASK' | 'CREATE_CASE' | 'UPDATE_AGENT_GPS' | 'RESOLVE_SOS';
  payload: any;
  timestamp: string;
  retries: number;
}

interface OfflineState {
  isOnline: boolean;
  isSimulatedOffline: boolean;
  pendingMutations: PendingMutation[];
  lastSyncedAt: string | null;
  isSyncing: boolean;

  setOnlineStatus: (status: boolean) => void;
  toggleSimulatedOffline: () => void;
  queueMutation: (type: PendingMutation['type'], payload: any) => void;
  syncPendingMutations: () => Promise<void>;
  clearPending: () => void;
}

export const useOfflineStore = create<OfflineState>((set, get) => ({
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  isSimulatedOffline: false,
  pendingMutations: [],
  lastSyncedAt: '2026-09-11T05:00:00Z',
  isSyncing: false,

  setOnlineStatus: (isOnline) => set({ isOnline }),
  toggleSimulatedOffline: () =>
    set((state) => ({
      isSimulatedOffline: !state.isSimulatedOffline,
      isOnline: state.isSimulatedOffline ? true : false,
    })),

  queueMutation: (type, payload) => {
    const mutation: PendingMutation = {
      id: `mut-${Date.now()}`,
      type,
      payload,
      timestamp: new Date().toISOString(),
      retries: 0,
    };
    set((state) => ({
      pendingMutations: [...state.pendingMutations, mutation],
    }));
  },

  syncPendingMutations: async () => {
    const { pendingMutations } = get();
    if (pendingMutations.length === 0) return;

    set({ isSyncing: true });
    // Simulate background network synchronization
    await new Promise((resolve) => setTimeout(resolve, 1200));

    set({
      pendingMutations: [],
      lastSyncedAt: new Date().toISOString(),
      isSyncing: false,
    });
  },

  clearPending: () => set({ pendingMutations: [] }),
}));
