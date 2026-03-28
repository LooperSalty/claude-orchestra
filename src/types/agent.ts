export interface AgentConfig {
  id: string;
  name: string;
  description?: string;
  systemPrompt?: string;
  claudeMdTemplate?: string;
  model: ClaudeModel;
  maxTokens: number;
  temperature: number;
  toolsEnabled: string[];
  mcpServers: McpServerConfig[];
  createdAt: string;
  updatedAt: string;
}

export type ClaudeModel =
  | 'claude-opus-4-6'
  | 'claude-sonnet-4-6'
  | 'claude-haiku-4-5-20251001';

export interface McpServerConfig {
  name: string;
  type: 'url' | 'stdio' | 'sse';
  url?: string;
  command?: string;
  args?: string[];
  env?: Record<string, string>;
  enabled: boolean;
}

export const DEFAULT_AGENTS: Omit<AgentConfig, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'Architect',
    description: 'System planning and architecture design',
    model: 'claude-sonnet-4-6',
    maxTokens: 16384,
    temperature: 0.0,
    toolsEnabled: [],
    mcpServers: [],
    systemPrompt: 'You are a senior software architect. Focus on system design, scalability, and clean architecture.',
  },
  {
    name: 'Speed Coder',
    description: 'Fast development, minimal questions',
    model: 'claude-sonnet-4-6',
    maxTokens: 8192,
    temperature: 0.0,
    toolsEnabled: [],
    mcpServers: [],
    systemPrompt: 'You are a fast, efficient developer. Write code directly without asking unnecessary questions.',
  },
  {
    name: 'Reviewer',
    description: 'Code review and improvement suggestions',
    model: 'claude-sonnet-4-6',
    maxTokens: 8192,
    temperature: 0.0,
    toolsEnabled: [],
    mcpServers: [],
    systemPrompt: 'You are a senior code reviewer. Analyze code for bugs, performance issues, and style improvements.',
  },
  {
    name: 'Debugger',
    description: 'Bug investigation and resolution',
    model: 'claude-sonnet-4-6',
    maxTokens: 8192,
    temperature: 0.0,
    toolsEnabled: [],
    mcpServers: [],
    systemPrompt: 'You are an expert debugger. Systematically investigate and fix bugs.',
  },
  {
    name: 'Tester',
    description: 'Test writing and quality assurance',
    model: 'claude-sonnet-4-6',
    maxTokens: 8192,
    temperature: 0.0,
    toolsEnabled: [],
    mcpServers: [],
    systemPrompt: 'You are a testing expert. Write comprehensive tests following TDD methodology.',
  },
];
