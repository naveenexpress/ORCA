import { create } from 'zustand';
import { NotificationItem } from '../types';

const API_BASE = 'http://localhost:3001/api';

interface NotifState {
  notifications: NotificationItem[];
  unreadCount: number;
  toastNotification: NotificationItem | null;
  isLoading: boolean;
  error: string | null;

  // ── READ ──────────────────────────────────────────────────────────────────
  fetchNotifications: () => Promise<void>;

  // ── WRITE ─────────────────────────────────────────────────────────────────
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  addNotification: (item: Omit<NotificationItem, 'id' | 'createdAt' | 'isRead'>) => Promise<NotificationItem | null>;
  deleteNotification: (id: string) => Promise<boolean>;
  dismissToast: () => void;
  clearError: () => void;
}

export const useNotifStore = create<NotifState>((set) => ({
  notifications: [],
  unreadCount: 0,
  toastNotification: null,
  isLoading: false,
  error: null,

  fetchNotifications: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API_BASE}/notifications`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: NotificationItem[] = await res.json();
      set({
        notifications: data,
        unreadCount: data.filter((n) => !n.isRead).length,
        isLoading: false,
      });
    } catch (e: any) {
      console.warn('[notifStore] fetchNotifications failed:', e.message);
      set({
        notifications: [],
        unreadCount: 0,
        isLoading: false,
        error: `Could not connect to API (${e.message}).`,
      });
    }
  },

  markAsRead: async (id: string) => {
    // Optimistic UI update
    set((state) => {
      const updated = state.notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n));
      return {
        notifications: updated,
        unreadCount: updated.filter((n) => !n.isRead).length,
      };
    });

    try {
      const res = await fetch(`${API_BASE}/notifications/${id}/read`, {
        method: 'PUT',
      });
      if (!res.ok) {
        console.warn(`[notifStore] markAsRead HTTP ${res.status}`);
      }
    } catch (e: any) {
      console.error('[notifStore] markAsRead failed:', e);
    }
  },

  markAllAsRead: async () => {
    // Optimistic UI update
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    }));

    try {
      const res = await fetch(`${API_BASE}/notifications/read-all`, {
        method: 'PUT',
      });
      if (!res.ok) {
        console.warn(`[notifStore] markAllAsRead HTTP ${res.status}`);
      }
    } catch (e: any) {
      console.error('[notifStore] markAllAsRead failed:', e);
    }
  },

  addNotification: async (item) => {
    const payload = {
      ...item,
      id: `notif-${Date.now()}`,
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    try {
      const res = await fetch(`${API_BASE}/notifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const created: NotificationItem = await res.json();

      set((state) => ({
        notifications: [created, ...state.notifications],
        unreadCount: state.unreadCount + 1,
        toastNotification: created,
      }));

      return created;
    } catch (e: any) {
      console.warn('[notifStore] addNotification fallback:', e.message);
      // Fallback local creation
      const localNotif: NotificationItem = {
        ...payload,
        id: `notif-${Date.now()}`,
      };

      set((state) => ({
        notifications: [localNotif, ...state.notifications],
        unreadCount: state.unreadCount + 1,
        toastNotification: localNotif,
      }));

      return localNotif;
    }
  },

  deleteNotification: async (id: string) => {
    // Optimistic UI update
    set((state) => {
      const updated = state.notifications.filter((n) => n.id !== id);
      return {
        notifications: updated,
        unreadCount: updated.filter((n) => !n.isRead).length,
      };
    });

    try {
      const res = await fetch(`${API_BASE}/notifications/${id}`, {
        method: 'DELETE',
      });
      return res.ok;
    } catch (e: any) {
      console.error('[notifStore] deleteNotification failed:', e);
      return false;
    }
  },

  dismissToast: () => set({ toastNotification: null }),
  clearError: () => set({ error: null }),
}));

// Trigger auto-fetch on store load
useNotifStore.getState().fetchNotifications();
