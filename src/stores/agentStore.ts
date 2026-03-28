import { create } from 'zustand';
import type { AgentConfig } from '@/types/agent';

interface AgentState {
  agents: AgentConfig[];
  selectedAgentId: string | null;
}

interface AgentActions {
  setAgents: (agents: AgentConfig[]) => void;
  addAgent: (agent: AgentConfig) => void;
  updateAgent: (id: string, updates: Partial<AgentConfig>) => void;
  removeAgent: (id: string) => void;
  setSelectedAgent: (id: string | null) => void;
}

export const useAgentStore = create<AgentState & AgentActions>((set) => ({
  agents: [],
  selectedAgentId: null,

  setAgents: (agents) => set({ agents }),

  addAgent: (agent) =>
    set((state) => ({ agents: [...state.agents, agent] })),

  updateAgent: (id, updates) =>
    set((state) => ({
      agents: state.agents.map((a) =>
        a.id === id ? { ...a, ...updates } : a
      ),
    })),

  removeAgent: (id) =>
    set((state) => ({
      agents: state.agents.filter((a) => a.id !== id),
      selectedAgentId:
        state.selectedAgentId === id ? null : state.selectedAgentId,
    })),

  setSelectedAgent: (id) => set({ selectedAgentId: id }),
}));
