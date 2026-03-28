import { create } from 'zustand';
import type { AgentConfig } from '@/types/agent';
import {
  dbListAgents,
  dbCreateAgent,
  dbUpdateAgent,
  dbDeleteAgent,
} from '@/lib/database';

interface AgentState {
  agents: AgentConfig[];
  selectedAgentId: string | null;
  isLoading: boolean;
}

interface AgentActions {
  loadAgents: () => Promise<void>;
  setAgents: (agents: AgentConfig[]) => void;
  addAgent: (agent: AgentConfig) => void;
  updateAgent: (id: string, updates: Partial<AgentConfig>) => void;
  removeAgent: (id: string) => void;
  setSelectedAgent: (id: string | null) => void;
}

export const useAgentStore = create<AgentState & AgentActions>((set) => ({
  agents: [],
  selectedAgentId: null,
  isLoading: false,

  loadAgents: async () => {
    set({ isLoading: true });
    try {
      const agents = await dbListAgents();
      set({ agents });
    } catch (err) {
      console.error('[agentStore] Failed to load agents:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  setAgents: (agents) => set({ agents }),

  addAgent: (agent) => {
    set((state) => ({ agents: [...state.agents, agent] }));
    dbCreateAgent(agent).catch((err) =>
      console.error('[agentStore] Failed to persist agent:', err),
    );
  },

  updateAgent: (id, updates) => {
    set((state) => ({
      agents: state.agents.map((a) =>
        a.id === id ? { ...a, ...updates } : a
      ),
    }));
    dbUpdateAgent(id, updates).catch((err) =>
      console.error('[agentStore] Failed to persist agent update:', err),
    );
  },

  removeAgent: (id) => {
    set((state) => ({
      agents: state.agents.filter((a) => a.id !== id),
      selectedAgentId:
        state.selectedAgentId === id ? null : state.selectedAgentId,
    }));
    dbDeleteAgent(id).catch((err) =>
      console.error('[agentStore] Failed to delete agent:', err),
    );
  },

  setSelectedAgent: (id) => set({ selectedAgentId: id }),
}));
