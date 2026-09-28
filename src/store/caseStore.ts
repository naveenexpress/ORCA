import { create } from 'zustand';
import { CaseItem, FieldTask, CasePriority, CaseStatus, TaskStatus, UserRole } from '../types';
import { SEED_TASKS } from '../data/seedData';

interface CaseState {
  cases: CaseItem[];
  tasks: FieldTask[];
  selectedCase: CaseItem | null;
  selectedTask: FieldTask | null;
  statusFilter: CaseStatus | 'ALL';
  priorityFilter: CasePriority | 'ALL';
  
  setSelectedCase: (c: CaseItem | null) => void;
  setSelectedTask: (t: FieldTask | null) => void;
  setStatusFilter: (status: CaseStatus | 'ALL') => void;
  setPriorityFilter: (priority: CasePriority | 'ALL') => void;
  
  fetchCases: () => Promise<void>;
  createCase: (newCase: Omit<CaseItem, 'id' | 'caseNumber' | 'createdAt' | 'updatedAt' | 'comments' | 'attachments' | 'escalationLevel'>) => Promise<CaseItem>;
  updateCaseStatus: (id: string, status: CaseStatus, closureReason?: string) => Promise<void>;
  addCaseComment: (caseId: string, authorId: string, authorName: string, authorRole: UserRole, text: string) => Promise<void>;
  updateTaskStatus: (id: string, status: TaskStatus, note?: string) => void;
  addTaskNote: (taskId: string, note: string) => void;
  deleteCase: (id: string) => Promise<void>;
}

export const useCaseStore = create<CaseState>((set, get) => ({
  cases: [],
  tasks: SEED_TASKS,
  selectedCase: null,
  selectedTask: SEED_TASKS[0],
  statusFilter: 'ALL',
  priorityFilter: 'ALL',

  setSelectedCase: (selectedCase) => set({ selectedCase }),
  setSelectedTask: (selectedTask) => set({ selectedTask }),
  setStatusFilter: (statusFilter) => set({ statusFilter }),
  setPriorityFilter: (priorityFilter) => set({ priorityFilter }),

  fetchCases: async () => {
    try {
      const res = await fetch('http://localhost:3001/api/cases');
      if (res.ok) {
        const data = await res.json();
        set({ cases: data, selectedCase: data.length ? data[0] : null });
      } else {
        set({ cases: [], selectedCase: null });
      }
    } catch (e) {
      console.error(e);
      set({ cases: [], selectedCase: null });
    }
  },

  createCase: async (caseInput) => {
    const timestamp = new Date().toISOString();
    const newCase: CaseItem = {
      ...caseInput,
      id: `case-${Date.now()}`,
      caseNumber: `ORCA-CAS-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'unassigned',
      escalationLevel: 0,
      comments: [
        {
          id: `com-${Date.now()}`,
          authorId: caseInput.requesterName,
          authorName: caseInput.requesterName,
          authorRole: caseInput.requesterRole,
          text: caseInput.description,
          createdAt: timestamp,
        }
      ],
      attachments: [],
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    try {
      const res = await fetch('http://localhost:3001/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCase)
      });
      if (res.ok) {
        const savedCase = await res.json();
        set((state) => ({
          cases: [savedCase, ...state.cases],
          selectedCase: savedCase,
        }));
        return savedCase;
      }
    } catch(e) {}

    set((state) => ({
      cases: [newCase, ...state.cases],
      selectedCase: newCase,
    }));

    return newCase;
  },

  updateCaseStatus: async (id, status, closureReason) => {
    const time = new Date().toISOString();
    const state = get();
    const c = state.cases.find(x => x.id === id);
    if (!c) return;
    
    const updated = {
      ...c,
      status,
      updatedAt: time,
      closedAt: status === 'closed' || status === 'resolved' ? time : c.closedAt,
      closureReason: closureReason || c.closureReason,
    };

    try {
      await fetch(`http://localhost:3001/api/cases/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
    } catch(e) {}

    set((state) => ({
      cases: state.cases.map((ca) => (ca.id === id ? updated : ca)),
      selectedCase: state.selectedCase?.id === id ? updated : state.selectedCase,
    }));
  },

  addCaseComment: async (caseId, authorId, authorName, authorRole, text) => {
    const newComment = {
      id: `com-${Date.now()}`,
      authorId,
      authorName,
      authorRole,
      text,
      createdAt: new Date().toISOString(),
      isInternal: false
    };

    try {
      await fetch(`http://localhost:3001/api/cases/${caseId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newComment)
      });
    } catch(e) {}

    set((state) => ({
      cases: state.cases.map((c) =>
        c.id === caseId ? { ...c, comments: [...c.comments, newComment], updatedAt: new Date().toISOString() } : c
      ),
      selectedCase: state.selectedCase?.id === caseId 
        ? { ...state.selectedCase, comments: [...state.selectedCase.comments, newComment], updatedAt: new Date().toISOString() } 
        : state.selectedCase,
    }));
  },

  updateTaskStatus: (id, status, note) => {
    const time = new Date().toISOString();
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id
          ? {
              ...t,
              status,
              notes: note ? [...t.notes, note] : t.notes,
              updatedAt: time,
            }
          : t
      ),
      selectedTask:
        state.selectedTask?.id === id
          ? {
              ...state.selectedTask,
              status,
              notes: note ? [...state.selectedTask.notes, note] : state.selectedTask.notes,
              updatedAt: time,
            }
          : state.selectedTask,
    }));
  },

  addTaskNote: (taskId, note) => {
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === taskId ? { ...t, notes: [...t.notes, note] } : t)),
    }));
  },
  
  deleteCase: async (id: string) => {
    try {
      await fetch(`http://localhost:3001/api/cases/${id}`, { method: 'DELETE' });
    } catch(e) {}
    set((state) => ({
      cases: state.cases.filter((c) => c.id !== id),
      selectedCase: state.selectedCase?.id === id ? null : state.selectedCase
    }));
  }
}));

useCaseStore.getState().fetchCases();
