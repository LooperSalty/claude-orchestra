import { create } from 'zustand';
import type { Session, Project, LogEntry } from '@/types/session';

interface SessionState {
  sessions: Session[];
  projects: Project[];
  logs: Record<string, LogEntry[]>;
  selectedSessionId: string | null;
}

interface SessionActions {
  setSessions: (sessions: Session[]) => void;
  addSession: (session: Session) => void;
  updateSession: (id: string, updates: Partial<Session>) => void;
  removeSession: (id: string) => void;
  setProjects: (projects: Project[]) => void;
  addProject: (project: Project) => void;
  appendLog: (sessionId: string, entry: LogEntry) => void;
  clearLogs: (sessionId: string) => void;
  setSelectedSession: (id: string | null) => void;
}

export const useSessionStore = create<SessionState & SessionActions>((set) => ({
  sessions: [],
  projects: [],
  logs: {},
  selectedSessionId: null,

  setSessions: (sessions) => set({ sessions }),

  addSession: (session) =>
    set((state) => ({ sessions: [...state.sessions, session] })),

  updateSession: (id, updates) =>
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === id ? { ...s, ...updates } : s
      ),
    })),

  removeSession: (id) =>
    set((state) => ({
      sessions: state.sessions.filter((s) => s.id !== id),
      selectedSessionId:
        state.selectedSessionId === id ? null : state.selectedSessionId,
    })),

  setProjects: (projects) => set({ projects }),

  addProject: (project) =>
    set((state) => ({ projects: [...state.projects, project] })),

  appendLog: (sessionId, entry) =>
    set((state) => ({
      logs: {
        ...state.logs,
        [sessionId]: [...(state.logs[sessionId] ?? []), entry],
      },
    })),

  clearLogs: (sessionId) =>
    set((state) => ({
      logs: { ...state.logs, [sessionId]: [] },
    })),

  setSelectedSession: (id) => set({ selectedSessionId: id }),
}));
