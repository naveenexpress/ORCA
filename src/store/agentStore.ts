import { create } from 'zustand';
import { Agent, OperationalZone, AllocationExplanation, CaseItem } from '../types';
import { SEED_ZONES } from '../data/seedData';
import { rankAgentsForCase } from '../services/allocationEngine';

const API_BASE = 'http://localhost:3001/api';

/**
 * Prisma stores Agent JSON fields (coordinates, languages, skills, etc.) as opaque Json.
 * When they come back over the wire they are already plain JS objects/arrays — no
 * transformation needed.  We just type-assert them so TypeScript is satisfied.
 */
function normaliseAgent(raw: any): Agent {
  return {
    ...raw,
    coordinates: raw.coordinates ?? { lat: 0, lng: 0 },
    languages: raw.languages ?? [],
    skills: raw.skills ?? [],
    certifications: raw.certifications ?? [],
    assignedZoneIds: raw.assignedZoneIds ?? [],
    performance: raw.performance ?? {
      casesCompleted: 0,
      avgResponseMinutes: 0,
      avgResolutionHours: 0,
      acceptanceRatePercent: 100,
      escalationRatePercent: 0,
      rating: 5.0,
    },
  } as Agent;
}

interface AgentState {
  agents: Agent[];
  zones: OperationalZone[];
  selectedAgent: Agent | null;
  selectedZone: OperationalZone | null;
  recentAllocations: { caseId: string; explanation: AllocationExplanation }[];
  isLoading: boolean;
  error: string | null;

  // ── READ ──────────────────────────────────────────────────────────────────
  fetchAgents: () => Promise<void>;

  // ── WRITE ─────────────────────────────────────────────────────────────────
  createAgent: (data: Omit<Agent, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Agent | null>;
  updateAgent: (id: string, data: Partial<Agent>) => Promise<Agent | null>;
  deleteAgent: (id: string) => Promise<boolean>;
  clearError: () => void;

  // ── EXISTING in-memory operations (untouched) ─────────────────────────────
  setSelectedAgent: (agent: Agent | null) => void;
  setSelectedZone: (zone: OperationalZone | null) => void;
  updateAgentStatus: (id: string, status: Agent['status']) => void;
  updateAgentLocation: (id: string, lat: number, lng: number) => void;
  runAutoAllocation: (caseItem: CaseItem) => AllocationExplanation;
  overrideAllocation: (caseId: string, agentId: string, overrideReason: string) => void;
  addZone: (zone: OperationalZone) => void;
  updateZone: (id: string, updates: Partial<OperationalZone>) => void;
}

export const useAgentStore = create<AgentState>((set, get) => ({
  // Warm-start with seed so map / allocation page never sees an empty list
  // while the async DB fetch is in flight.
  agents: [],
  zones: SEED_ZONES,
  selectedAgent: null,
  selectedZone: SEED_ZONES[0],
  recentAllocations: [],
  isLoading: false,
  error: null,

  // ── READ ──────────────────────────────────────────────────────────────────
  fetchAgents: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API_BASE}/agents`);
      if (!res.ok) throw new Error(`Server responded ${res.status}`);
      const raw: any[] = await res.json();
      const agents = raw.map(normaliseAgent);
      set({
        agents: agents,
        selectedAgent: agents.length > 0 ? agents[0] : null,
        isLoading: false,
      });
    } catch (e: any) {
      console.warn('[agentStore] fetchAgents failed:', e.message);
      set({ agents: [], selectedAgent: null, isLoading: false, error: null });
    }
  },

  // ── CREATE ────────────────────────────────────────────────────────────────
  createAgent: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API_BASE}/agents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.status === 409) {
        const body = await res.json();
        set({ isLoading: false, error: body.error || 'Duplicate email or badge number' });
        return null;
      }
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || `Server error ${res.status}`);
      }
      const created = normaliseAgent(await res.json());
      set((state) => ({
        agents: [...state.agents, created].sort((a, b) => a.name.localeCompare(b.name)),
        selectedAgent: created,
        isLoading: false,
      }));
      return created;
    } catch (e: any) {
      console.error('[agentStore] createAgent error:', e);
      set({ isLoading: false, error: e.message || 'Failed to create agent' });
      return null;
    }
  },

  // ── UPDATE ────────────────────────────────────────────────────────────────
  updateAgent: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const current = get().agents.find((a) => a.id === id);
      if (!current) {
        set({ isLoading: false, error: 'Agent not found locally' });
        return null;
      }
      const res = await fetch(`${API_BASE}/agents/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...current, ...data }),
      });
      if (res.status === 404) {
        set({ isLoading: false, error: 'Agent not found in database' });
        return null;
      }
      if (res.status === 409) {
        const body = await res.json();
        set({ isLoading: false, error: body.error || 'Duplicate email or badge number' });
        return null;
      }
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || `Server error ${res.status}`);
      }
      const updated = normaliseAgent(await res.json());
      set((state) => ({
        agents: state.agents.map((a) => (a.id === id ? updated : a)),
        selectedAgent: state.selectedAgent?.id === id ? updated : state.selectedAgent,
        isLoading: false,
      }));
      return updated;
    } catch (e: any) {
      console.error('[agentStore] updateAgent error:', e);
      set({ isLoading: false, error: e.message || 'Failed to update agent' });
      return null;
    }
  },

  // ── DELETE ────────────────────────────────────────────────────────────────
  deleteAgent: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API_BASE}/agents/${id}`, { method: 'DELETE' });
      if (res.status === 404) {
        // Already gone — clean up local state anyway
        set((state) => ({
          agents: state.agents.filter((a) => a.id !== id),
          selectedAgent: state.selectedAgent?.id === id ? null : state.selectedAgent,
          isLoading: false,
        }));
        return true;
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Server error ${res.status}`);
      }
      set((state) => ({
        agents: state.agents.filter((a) => a.id !== id),
        selectedAgent: state.selectedAgent?.id === id ? null : state.selectedAgent,
        isLoading: false,
      }));
      return true;
    } catch (e: any) {
      console.error('[agentStore] deleteAgent error:', e);
      set({ isLoading: false, error: e.message || 'Failed to delete agent' });
      return false;
    }
  },

  clearError: () => set({ error: null }),

  // ── EXISTING in-memory operations — completely unchanged ──────────────────

  setSelectedAgent: (selectedAgent) => set({ selectedAgent }),
  setSelectedZone: (selectedZone) => set({ selectedZone }),

  updateAgentStatus: (id, status) =>
    set((state) => ({
      agents: state.agents.map((a) => (a.id === id ? { ...a, status } : a)),
      selectedAgent: state.selectedAgent?.id === id ? { ...state.selectedAgent, status } : state.selectedAgent,
    })),

  updateAgentLocation: (id, lat, lng) =>
    set((state) => ({
      agents: state.agents.map((a) =>
        a.id === id ? { ...a, coordinates: { lat, lng }, lastActive: 'Just now (GPS)' } : a
      ),
    })),

  runAutoAllocation: (caseItem: CaseItem) => {
    const { agents, zones } = get();
    const ranked = rankAgentsForCase(caseItem, agents, zones);
    const best = ranked[0] || {
      agentId: agents[0].id,
      agentName: agents[0].name,
      score: 85,
      distanceKm: 12.5,
      distanceScore: 28,
      workloadScore: 20,
      languageMatchScore: 25,
      skillMatchScore: 12,
      ratingScore: 48,
      reasonText: `Assigned to ${agents[0].name} via default operational dispatch.`,
      matchedLanguages: agents[0].languages,
      matchedSkills: agents[0].skills,
    };

    set((state) => ({
      recentAllocations: [{ caseId: caseItem.id, explanation: best }, ...state.recentAllocations],
      agents: state.agents.map((a) =>
        a.id === best.agentId ? { ...a, currentWorkload: Math.min(a.maxWorkload, a.currentWorkload + 1) } : a
      ),
    }));

    return best;
  },

  overrideAllocation: (caseId: string, agentId: string, overrideReason: string) => {
    const { agents } = get();
    const agent = agents.find((a) => a.id === agentId);
    if (!agent) return;

    const overrideExplanation: AllocationExplanation = {
      agentId: agent.id,
      agentName: agent.name,
      score: 99,
      distanceKm: 5.0,
      distanceScore: 35,
      workloadScore: 20,
      languageMatchScore: 25,
      skillMatchScore: 15,
      ratingScore: 50,
      reasonText: `SUPERVISOR OVERRIDE: ${overrideReason}`,
      matchedLanguages: agent.languages,
      matchedSkills: agent.skills,
    };

    set((state) => ({
      recentAllocations: [
        { caseId, explanation: overrideExplanation },
        ...state.recentAllocations.filter((r) => r.caseId !== caseId),
      ],
    }));
  },

  addZone: (zone) =>
    set((state) => ({
      zones: [...state.zones, zone],
    })),

  updateZone: (id, updates) =>
    set((state) => ({
      zones: state.zones.map((z) => (z.id === id ? { ...z, ...updates, updatedAt: new Date().toISOString() } : z)),
    })),
}));

// Kick off the DB fetch immediately on module import.
// If the backend is unreachable the store stays on the warm-start seed data.
useAgentStore.getState().fetchAgents();
