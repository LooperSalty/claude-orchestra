import { create } from 'zustand';
import type { Session, Project, LogEntry } from '@/types/session';
import {
  dbListSessions,
  dbCreateSession,
  dbUpdateSession,
  dbDeleteSession,
  dbAddLog,
  dbGetLogs,
} from '@/lib/database';

interface SessionState {
  sessions: Session[];
  projects: Project[];
  logs: Record<string, LogEntry[]>;
  selectedSessionId: string | null;
  isLoading: boolean;
}

interface SessionActions {
  loadSessions: () => Promise<void>;
  setSessions: (sessions: Session[]) => void;
  addSession: (session: Session & { projectName?: string; projectPath?: string }) => void;
  updateSession: (id: string, updates: Partial<Session>) => void;
  removeSession: (id: string) => void;
  setProjects: (projects: Project[]) => void;
  addProject: (project: Project) => void;
  appendLog: (sessionId: string, entry: LogEntry) => void;
  loadLogs: (sessionId: string) => Promise<void>;
  clearLogs: (sessionId: string) => void;
  setSelectedSession: (id: string | null) => void;
}

export const useSessionStore = create<SessionState & SessionActions>((set) => ({
  sessions: [],
  projects: [],
  logs: {},
  selectedSessionId: null,
  isLoading: false,

  loadSessions: async () => {
    set({ isLoading: true });
    try {
      const sessions = await dbListSessions();
      set({ sessions });
    } catch (err) {
      console.error('[sessionStore] Failed to load sessions:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  setSessions: (sessions) => set({ sessions }),

  addSession: (session) => {
    set((state) => ({ sessions: [...state.sessions, session] }));
    dbCreateSession(session).catch((err) =>
      console.error('[sessionStore] Failed to persist session:', err),
    );
  },

  updateSession: (id, updates) => {
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === id ? { ...s, ...updates } : s
      ),
    }));
    dbUpdateSession(id, updates).catch((err) =>
      console.error('[sessionStore] Failed to persist session update:', err),
    );
  },

  removeSession: (id) => {
    set((state) => ({
      sessions: state.sessions.filter((s) => s.id !== id),
      selectedSessionId:
        state.selectedSessionId === id ? null : state.selectedSessionId,
    }));
    dbDeleteSession(id).catch((err) =>
      console.error('[sessionStore] Failed to delete session:', err),
    );
  },

  setProjects: (projects) => set({ projects }),

  addProject: (project) =>
    set((state) => ({ projects: [...state.projects, project] })),

  appendLog: (sessionId, entry) => {
    set((state) => ({
      logs: {
        ...state.logs,
        [sessionId]: [...(state.logs[sessionId] ?? []), entry],
      },
    }));
    dbAddLog(sessionId, entry.logType, entry.content).catch((err) =>
      console.error('[sessionStore] Failed to persist log:', err),
    );
  },

  loadLogs: async (sessionId) => {
    try {
      const entries = await dbGetLogs(sessionId);
      set((state) => ({
        logs: { ...state.logs, [sessionId]: entries },
      }));
    } catch (err) {
      console.error('[sessionStore] Failed to load logs:', err);
    }
  },

  clearLogs: (sessionId) =>
    set((state) => ({
      logs: { ...state.logs, [sessionId]: [] },
    })),

  setSelectedSession: (id) => set({ selectedSessionId: id }),
}));
