import { create } from 'zustand';
import { Coordinates, SosEmergencyType, SosIncident, SosStatus } from '../types';

interface SosState {
  incidents: SosIncident[];
  activeIncident: SosIncident | null;
  isTriggerModalOpen: boolean;
  
  openTriggerModal: () => void;
  closeTriggerModal: () => void;
  setActiveIncident: (incident: SosIncident | null) => void;
  fetchIncidents: () => Promise<void>;
  triggerNewSos: (params: {
    callerName: string;
    callerPhone: string;
    vesselRegNumber?: string;
    emergencyType: SosEmergencyType;
    peopleAffectedCount: number;
    coordinates: Coordinates;
    locationDescription: string;
  }) => Promise<SosIncident>;
  updateSosStatus: (id: string, status: SosStatus, notes?: string, actorName?: string) => Promise<void>;
  assignAgentToSos: (id: string, agentId: string) => Promise<void>;
  deleteSos: (id: string) => Promise<void>;
}

export const useSosStore = create<SosState>((set, get) => ({
  incidents: [],
  activeIncident: null,
  isTriggerModalOpen: false,

  openTriggerModal: () => set({ isTriggerModalOpen: true }),
  closeTriggerModal: () => set({ isTriggerModalOpen: false }),
  setActiveIncident: (activeIncident) => set({ activeIncident }),

  fetchIncidents: async () => {
    try {
      const res = await fetch('http://localhost:3001/api/sos');
      if (res.ok) {
        const data = await res.json();
        set({ incidents: data, activeIncident: data.length ? data[0] : null });
      }
    } catch (e) {
      console.error('Failed to fetch incidents', e);
      set({ incidents: [], activeIncident: null });
    }
  },

  triggerNewSos: async ({
    callerName,
    callerPhone,
    vesselRegNumber,
    emergencyType,
    peopleAffectedCount,
    coordinates,
    locationDescription,
  }) => {
    const timestamp = new Date().toISOString();
    const newIncident: SosIncident = {
      id: `sos-live-${Date.now()}`,
      incidentCode: `ORCA-SOS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      callerName,
      callerPhone,
      vesselRegNumber: vesselRegNumber || 'UNREGISTERED_VESSEL',
      emergencyType,
      peopleAffectedCount,
      severity: 'CRITICAL_LIFE_THREAT',
      status: 'responding',
      coordinates,
      locationDescription,
      nearestLandingCentre: 'Calculating...', // Backend computes from actual coordinates
      distanceFromShoreKm: 0, // Backend computes from actual coordinates
      assignedAgentIds: ['agt-chn-01', 'agt-chn-02'],
      assignedSupervisorId: 'usr-sup-05',
      disasterAuthorityNotified: true,
      coastGuardCaseRef: `ICG-MRCC-EMERGENCY-${Date.now().toString().slice(-4)}`,
      timeline: [
        {
          time: timestamp,
          action: 'Distress Beacon Activated via ORCA Marine Mobile',
          actor: callerName,
          notes: `Emergency: ${emergencyType}. Affected souls: ${peopleAffectedCount}. Coordinates: ${coordinates.lat.toFixed(4)}°N, ${coordinates.lng.toFixed(4)}°E.`,
        },
        {
          time: new Date(Date.now() + 1000 * 30).toISOString(),
          action: 'Indian Coast Guard MRCC & Field Agents Notified',
          actor: 'ORCA Autonomous SAR Agent',
          notes: 'High-priority alert dispatched to SDMA Maritime cell.',
        },
      ],
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    try {
      const res = await fetch('http://localhost:3001/api/sos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newIncident)
      });
      if (res.ok) {
        const savedIncident = await res.json();
        set((state) => ({
          incidents: [savedIncident, ...state.incidents],
          activeIncident: savedIncident,
          isTriggerModalOpen: false,
        }));
        return savedIncident;
      }
    } catch (e) {
      console.error(e);
    }

    // Fallback
    set((state) => ({
      incidents: [newIncident, ...state.incidents],
      activeIncident: newIncident,
      isTriggerModalOpen: false,
    }));
    return newIncident;
  },

  updateSosStatus: async (id, status, notes, actorName = 'Operations Officer') => {
    const time = new Date().toISOString();
    const state = get();
    const inc = state.incidents.find(i => i.id === id);
    if (!inc) return;

    const newTimeline = [
      ...inc.timeline,
      {
        time,
        action: `Status Updated to ${status.toUpperCase()}`,
        actor: actorName,
        notes: notes || 'Operational state change recorded.',
      },
    ];

    const updatedIncident = {
      ...inc,
      status,
      updatedAt: time,
      timeline: newTimeline,
    };

    try {
      await fetch(`http://localhost:3001/api/sos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedIncident)
      });
    } catch (e) {
      console.error(e);
    }

    set((state) => ({
      incidents: state.incidents.map((i) => (i.id === id ? updatedIncident : i)),
      activeIncident: state.activeIncident?.id === id ? updatedIncident : state.activeIncident,
    }));
  },

  assignAgentToSos: async (id, agentId) => {
    const state = get();
    const inc = state.incidents.find(i => i.id === id);
    if (!inc || inc.assignedAgentIds.includes(agentId)) return;
    
    const updated = { ...inc, assignedAgentIds: [...inc.assignedAgentIds, agentId], updatedAt: new Date().toISOString() };
    try {
      await fetch(`http://localhost:3001/api/sos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
    } catch (e) {}

    set((state) => ({
      incidents: state.incidents.map((i) => (i.id === id ? updated : i)),
      activeIncident: state.activeIncident?.id === id ? updated : state.activeIncident
    }));
  },

  deleteSos: async (id: string) => {
    try {
      await fetch(`http://localhost:3001/api/sos/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.error('Failed to delete', e);
    }
    set((state) => ({
      incidents: state.incidents.filter(i => i.id !== id),
      activeIncident: state.activeIncident?.id === id ? null : state.activeIncident
    }));
  }
}));

useSosStore.getState().fetchIncidents();

