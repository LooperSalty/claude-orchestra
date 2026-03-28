export interface Project {
  id: string;
  name: string;
  path: string;
  description?: string;
  lastOpenedAt?: string;
  createdAt: string;
  config: ProjectConfig;
  tags: string[];
  pinned: boolean;
}

export interface ProjectConfig {
  defaultModel?: ClaudeModel;
  defaultAgentId?: string;
  mcpServers?: string[];
  customEnv?: Record<string, string>;
}

export interface Session {
  id: string;
  projectId: string;
  pid?: number;
  status: SessionStatus;
  startedAt?: string;
  endedAt?: string;
  totalTokensUsed: number;
  totalCostCents: number;
  model: string;
  logPath?: string;
  configOverride: Partial<AgentConfig>;
  createdAt: string;
}

export type SessionStatus = 'running' | 'stopped' | 'error' | 'paused';

export interface SessionWithProject extends Session {
  project: Project;
}

export interface LogEntry {
  id: number;
  sessionId: string;
  logType: 'stdin' | 'stdout' | 'stderr' | 'system';
  content: string;
  timestamp: string;
}

// Re-export for convenience
import type { AgentConfig, ClaudeModel } from './agent';
export type { AgentConfig, ClaudeModel };
