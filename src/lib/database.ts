import type { Session, LogEntry } from '@/types/session';
import type { AgentConfig } from '@/types/agent';
import type { Skill } from '@/types/skill';
import type { Plugin } from '@/types/plugin';
import type { Prompt } from '@/types/prompt';

// Lazy-loaded database connection
type DatabaseInstance = {
  select: <T>(query: string, bindValues?: unknown[]) => Promise<T>;
  execute: (query: string, bindValues?: unknown[]) => Promise<{ rowsAffected: number; lastInsertId?: number }>;
};

let db: DatabaseInstance | null = null;
let loadFailed = false;

async function getDatabase(): Promise<DatabaseInstance | null> {
  if (db) return db;
  if (loadFailed) return null;

  try {
    const Database = await import('@tauri-apps/plugin-sql');
    db = await Database.default.load('sqlite:orchestra.db') as unknown as DatabaseInstance;
    return db;
  } catch {
    loadFailed = true;
    console.warn('[database] Tauri SQL plugin not available — using mock data');
    return null;
  }
}

// ---------- Helper: check if running inside Tauri ----------

function isTauri(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

// ---------- Row mappers (snake_case DB -> camelCase TS) ----------

interface SessionRow {
  id: string;
  project_id: string | null;
  project_name: string;
  project_path: string;
  pid: number | null;
  status: string;
  started_at: string | null;
  stopped_at: string | null;
  total_tokens: number;
  total_cost: number;
  model: string;
  log_path: string | null;
  config_override: string | null;
}

function mapSessionRow(row: SessionRow): Session {
  return {
    id: row.id,
    projectId: row.project_id ?? '',
    pid: row.pid ?? undefined,
    status: row.status as Session['status'],
    startedAt: row.started_at ?? undefined,
    endedAt: row.stopped_at ?? undefined,
    totalTokensUsed: row.total_tokens,
    totalCostCents: Math.round(row.total_cost * 100),
    model: row.model,
    logPath: row.log_path ?? undefined,
    configOverride: row.config_override ? JSON.parse(row.config_override) : {},
    createdAt: row.started_at ?? new Date().toISOString(),
  };
}

interface AgentRow {
  id: string;
  name: string;
  description: string | null;
  system_prompt: string | null;
  claude_md_template: string | null;
  model: string;
  max_tokens: number;
  temperature: number;
  tools_enabled: number;
  mcp_servers: string;
  is_builtin: number;
  created_at: string;
  updated_at: string;
}

function mapAgentRow(row: AgentRow): AgentConfig {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? undefined,
    systemPrompt: row.system_prompt ?? undefined,
    claudeMdTemplate: row.claude_md_template ?? undefined,
    model: row.model as AgentConfig['model'],
    maxTokens: row.max_tokens,
    temperature: row.temperature,
    toolsEnabled: row.tools_enabled ? [] : [],
    mcpServers: JSON.parse(row.mcp_servers || '[]'),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

interface SkillRow {
  id: string;
  name: string;
  description: string | null;
  path: string;
  version: string | null;
  category: string;
  icon: string | null;
  is_builtin: number;
  is_enabled: number;
  config_json: string;
  readme_content: string | null;
  installed_at: string;
}

function mapSkillRow(row: SkillRow): Skill {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? undefined,
    path: row.path,
    version: row.version ?? undefined,
    category: row.category as Skill['category'],
    icon: row.icon ?? undefined,
    isBuiltin: row.is_builtin === 1,
    isEnabled: row.is_enabled === 1,
    config: JSON.parse(row.config_json || '{}'),
    readmeContent: row.readme_content ?? undefined,
    installedAt: row.installed_at,
  };
}

interface PluginRow {
  id: string;
  name: string;
  description: string | null;
  plugin_type: string;
  version: string | null;
  status: string;
  config_json: string;
  server_url: string | null;
  installed_at: string;
}

function mapPluginRow(row: PluginRow): Plugin {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? undefined,
    type: row.plugin_type as Plugin['type'],
    url: row.server_url ?? undefined,
    status: row.status as Plugin['status'],
    config: JSON.parse(row.config_json || '{}'),
    installedAt: row.installed_at,
  };
}

interface PromptRow {
  id: string;
  name: string;
  description: string | null;
  content: string;
  category: string;
  is_favorite: number;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

function mapPromptRow(row: PromptRow): Prompt {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? '',
    content: row.content,
    category: row.category as Prompt['category'],
    isFavorite: row.is_favorite === 1,
    usageCount: row.usage_count,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

interface LogRow {
  id: number;
  session_id: string;
  log_type: string;
  content: string;
  timestamp: string;
}

function mapLogRow(row: LogRow): LogEntry {
  return {
    id: row.id,
    sessionId: row.session_id,
    logType: row.log_type as LogEntry['logType'],
    content: row.content,
    timestamp: row.timestamp,
  };
}

// ================================================================
//  SESSION CRUD
// ================================================================

export async function dbListSessions(): Promise<Session[]> {
  if (!isTauri()) return [];
  const database = await getDatabase();
  if (!database) return [];

  const rows = await database.select<SessionRow[]>('SELECT * FROM sessions ORDER BY started_at DESC');
  return rows.map(mapSessionRow);
}

export async function dbCreateSession(session: Partial<Session> & { projectName?: string; projectPath?: string }): Promise<void> {
  if (!isTauri()) return;
  const database = await getDatabase();
  if (!database) return;

  const now = new Date().toISOString();
  await database.execute(
    `INSERT INTO sessions (id, project_id, project_name, project_path, pid, status, started_at, stopped_at, total_tokens, total_cost, model, log_path, config_override)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
    [
      session.id ?? crypto.randomUUID(),
      session.projectId ?? null,
      session.projectName ?? 'Unknown',
      session.projectPath ?? '',
      session.pid ?? null,
      session.status ?? 'idle',
      session.startedAt ?? now,
      session.endedAt ?? null,
      session.totalTokensUsed ?? 0,
      (session.totalCostCents ?? 0) / 100,
      session.model ?? 'claude-sonnet-4-20250514',
      session.logPath ?? null,
      JSON.stringify(session.configOverride ?? {}),
    ],
  );
}

export async function dbUpdateSession(id: string, updates: Partial<Session>): Promise<void> {
  if (!isTauri()) return;
  const database = await getDatabase();
  if (!database) return;

  const setClauses: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  const fieldMap: Record<string, string> = {
    projectId: 'project_id',
    pid: 'pid',
    status: 'status',
    startedAt: 'started_at',
    endedAt: 'stopped_at',
    totalTokensUsed: 'total_tokens',
    model: 'model',
    logPath: 'log_path',
  };

  for (const [tsKey, dbCol] of Object.entries(fieldMap)) {
    const value = (updates as Record<string, unknown>)[tsKey];
    if (value !== undefined) {
      setClauses.push(`${dbCol} = $${idx}`);
      values.push(value);
      idx++;
    }
  }

  if (updates.totalCostCents !== undefined) {
    setClauses.push(`total_cost = $${idx}`);
    values.push(updates.totalCostCents / 100);
    idx++;
  }

  if (updates.configOverride !== undefined) {
    setClauses.push(`config_override = $${idx}`);
    values.push(JSON.stringify(updates.configOverride));
    idx++;
  }

  if (setClauses.length === 0) return;

  values.push(id);
  await database.execute(
    `UPDATE sessions SET ${setClauses.join(', ')} WHERE id = $${idx}`,
    values,
  );
}

export async function dbDeleteSession(id: string): Promise<void> {
  if (!isTauri()) return;
  const database = await getDatabase();
  if (!database) return;

  await database.execute('DELETE FROM session_logs WHERE session_id = $1', [id]);
  await database.execute('DELETE FROM sessions WHERE id = $1', [id]);
}

// ================================================================
//  AGENT CRUD
// ================================================================

export async function dbListAgents(): Promise<AgentConfig[]> {
  if (!isTauri()) return [];
  const database = await getDatabase();
  if (!database) return [];

  const rows = await database.select<AgentRow[]>('SELECT * FROM agents ORDER BY is_builtin DESC, name ASC');
  return rows.map(mapAgentRow);
}

export async function dbCreateAgent(agent: Partial<AgentConfig>): Promise<void> {
  if (!isTauri()) return;
  const database = await getDatabase();
  if (!database) return;

  const now = new Date().toISOString();
  await database.execute(
    `INSERT INTO agents (id, name, description, system_prompt, claude_md_template, model, max_tokens, temperature, tools_enabled, mcp_servers, is_builtin, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
    [
      agent.id ?? crypto.randomUUID(),
      agent.name ?? 'Unnamed Agent',
      agent.description ?? null,
      agent.systemPrompt ?? null,
      agent.claudeMdTemplate ?? null,
      agent.model ?? 'claude-sonnet-4-6',
      agent.maxTokens ?? 8192,
      agent.temperature ?? 0.7,
      agent.toolsEnabled ? 1 : 0,
      JSON.stringify(agent.mcpServers ?? []),
      0,
      now,
      now,
    ],
  );
}

export async function dbUpdateAgent(id: string, updates: Partial<AgentConfig>): Promise<void> {
  if (!isTauri()) return;
  const database = await getDatabase();
  if (!database) return;

  const setClauses: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  const fieldMap: Record<string, string> = {
    name: 'name',
    description: 'description',
    systemPrompt: 'system_prompt',
    claudeMdTemplate: 'claude_md_template',
    model: 'model',
    maxTokens: 'max_tokens',
    temperature: 'temperature',
  };

  for (const [tsKey, dbCol] of Object.entries(fieldMap)) {
    const value = (updates as Record<string, unknown>)[tsKey];
    if (value !== undefined) {
      setClauses.push(`${dbCol} = $${idx}`);
      values.push(value);
      idx++;
    }
  }

  if (updates.toolsEnabled !== undefined) {
    setClauses.push(`tools_enabled = $${idx}`);
    values.push(updates.toolsEnabled.length > 0 ? 1 : 0);
    idx++;
  }

  if (updates.mcpServers !== undefined) {
    setClauses.push(`mcp_servers = $${idx}`);
    values.push(JSON.stringify(updates.mcpServers));
    idx++;
  }

  // Always update updated_at
  setClauses.push(`updated_at = $${idx}`);
  values.push(new Date().toISOString());
  idx++;

  if (setClauses.length <= 1) return; // only updated_at, no real changes

  values.push(id);
  await database.execute(
    `UPDATE agents SET ${setClauses.join(', ')} WHERE id = $${idx}`,
    values,
  );
}

export async function dbDeleteAgent(id: string): Promise<void> {
  if (!isTauri()) return;
  const database = await getDatabase();
  if (!database) return;

  await database.execute('DELETE FROM agents WHERE id = $1 AND is_builtin = 0', [id]);
}

// ================================================================
//  SKILL CRUD
// ================================================================

export async function dbListSkills(): Promise<Skill[]> {
  if (!isTauri()) return [];
  const database = await getDatabase();
  if (!database) return [];

  const rows = await database.select<SkillRow[]>('SELECT * FROM skills ORDER BY name ASC');
  return rows.map(mapSkillRow);
}

export async function dbCreateSkill(skill: Partial<Skill>): Promise<void> {
  if (!isTauri()) return;
  const database = await getDatabase();
  if (!database) return;

  const now = new Date().toISOString();
  await database.execute(
    `INSERT INTO skills (id, name, description, path, version, category, icon, is_builtin, is_enabled, config_json, readme_content, installed_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
    [
      skill.id ?? crypto.randomUUID(),
      skill.name ?? 'Unnamed Skill',
      skill.description ?? null,
      skill.path ?? '',
      skill.version ?? null,
      skill.category ?? 'custom',
      skill.icon ?? null,
      skill.isBuiltin ? 1 : 0,
      skill.isEnabled !== false ? 1 : 0,
      JSON.stringify(skill.config ?? {}),
      skill.readmeContent ?? null,
      now,
    ],
  );
}

export async function dbUpdateSkill(id: string, updates: Partial<Skill>): Promise<void> {
  if (!isTauri()) return;
  const database = await getDatabase();
  if (!database) return;

  const setClauses: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  const fieldMap: Record<string, string> = {
    name: 'name',
    description: 'description',
    path: 'path',
    version: 'version',
    category: 'category',
    icon: 'icon',
  };

  for (const [tsKey, dbCol] of Object.entries(fieldMap)) {
    const value = (updates as Record<string, unknown>)[tsKey];
    if (value !== undefined) {
      setClauses.push(`${dbCol} = $${idx}`);
      values.push(value);
      idx++;
    }
  }

  if (updates.isEnabled !== undefined) {
    setClauses.push(`is_enabled = $${idx}`);
    values.push(updates.isEnabled ? 1 : 0);
    idx++;
  }

  if (updates.config !== undefined) {
    setClauses.push(`config_json = $${idx}`);
    values.push(JSON.stringify(updates.config));
    idx++;
  }

  if (updates.readmeContent !== undefined) {
    setClauses.push(`readme_content = $${idx}`);
    values.push(updates.readmeContent);
    idx++;
  }

  if (setClauses.length === 0) return;

  values.push(id);
  await database.execute(
    `UPDATE skills SET ${setClauses.join(', ')} WHERE id = $${idx}`,
    values,
  );
}

export async function dbDeleteSkill(id: string): Promise<void> {
  if (!isTauri()) return;
  const database = await getDatabase();
  if (!database) return;

  await database.execute('DELETE FROM skills WHERE id = $1 AND is_builtin = 0', [id]);
}

// ================================================================
//  PLUGIN CRUD
// ================================================================

export async function dbListPlugins(): Promise<Plugin[]> {
  if (!isTauri()) return [];
  const database = await getDatabase();
  if (!database) return [];

  const rows = await database.select<PluginRow[]>('SELECT * FROM plugins ORDER BY name ASC');
  return rows.map(mapPluginRow);
}

export async function dbCreatePlugin(plugin: Partial<Plugin>): Promise<void> {
  if (!isTauri()) return;
  const database = await getDatabase();
  if (!database) return;

  const now = new Date().toISOString();
  await database.execute(
    `INSERT INTO plugins (id, name, description, plugin_type, version, status, config_json, server_url, installed_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [
      plugin.id ?? crypto.randomUUID(),
      plugin.name ?? 'Unnamed Plugin',
      plugin.description ?? null,
      plugin.type ?? 'mcp_server',
      null,
      plugin.status ?? 'disconnected',
      JSON.stringify(plugin.config ?? {}),
      plugin.url ?? null,
      now,
    ],
  );
}

export async function dbUpdatePlugin(id: string, updates: Partial<Plugin>): Promise<void> {
  if (!isTauri()) return;
  const database = await getDatabase();
  if (!database) return;

  const setClauses: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  const fieldMap: Record<string, string> = {
    name: 'name',
    description: 'description',
    type: 'plugin_type',
    status: 'status',
    url: 'server_url',
  };

  for (const [tsKey, dbCol] of Object.entries(fieldMap)) {
    const value = (updates as Record<string, unknown>)[tsKey];
    if (value !== undefined) {
      setClauses.push(`${dbCol} = $${idx}`);
      values.push(value);
      idx++;
    }
  }

  if (updates.config !== undefined) {
    setClauses.push(`config_json = $${idx}`);
    values.push(JSON.stringify(updates.config));
    idx++;
  }

  if (setClauses.length === 0) return;

  values.push(id);
  await database.execute(
    `UPDATE plugins SET ${setClauses.join(', ')} WHERE id = $${idx}`,
    values,
  );
}

export async function dbDeletePlugin(id: string): Promise<void> {
  if (!isTauri()) return;
  const database = await getDatabase();
  if (!database) return;

  await database.execute('DELETE FROM plugins WHERE id = $1', [id]);
}

// ================================================================
//  PROMPT CRUD
// ================================================================

export async function dbListPrompts(): Promise<Prompt[]> {
  if (!isTauri()) return [];
  const database = await getDatabase();
  if (!database) return [];

  const rows = await database.select<PromptRow[]>('SELECT * FROM prompts ORDER BY is_favorite DESC, usage_count DESC, name ASC');
  return rows.map(mapPromptRow);
}

export async function dbCreatePrompt(prompt: Partial<Prompt>): Promise<void> {
  if (!isTauri()) return;
  const database = await getDatabase();
  if (!database) return;

  const now = new Date().toISOString();
  await database.execute(
    `INSERT INTO prompts (id, name, description, content, category, is_favorite, usage_count, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [
      prompt.id ?? crypto.randomUUID(),
      prompt.name ?? 'Unnamed Prompt',
      prompt.description ?? '',
      prompt.content ?? '',
      prompt.category ?? 'general',
      prompt.isFavorite ? 1 : 0,
      prompt.usageCount ?? 0,
      now,
      now,
    ],
  );
}

export async function dbUpdatePrompt(id: string, updates: Partial<Prompt>): Promise<void> {
  if (!isTauri()) return;
  const database = await getDatabase();
  if (!database) return;

  const setClauses: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  const fieldMap: Record<string, string> = {
    name: 'name',
    description: 'description',
    content: 'content',
    category: 'category',
  };

  for (const [tsKey, dbCol] of Object.entries(fieldMap)) {
    const value = (updates as Record<string, unknown>)[tsKey];
    if (value !== undefined) {
      setClauses.push(`${dbCol} = $${idx}`);
      values.push(value);
      idx++;
    }
  }

  if (updates.isFavorite !== undefined) {
    setClauses.push(`is_favorite = $${idx}`);
    values.push(updates.isFavorite ? 1 : 0);
    idx++;
  }

  if (updates.usageCount !== undefined) {
    setClauses.push(`usage_count = $${idx}`);
    values.push(updates.usageCount);
    idx++;
  }

  // Always update updated_at
  setClauses.push(`updated_at = $${idx}`);
  values.push(new Date().toISOString());
  idx++;

  if (setClauses.length <= 1) return;

  values.push(id);
  await database.execute(
    `UPDATE prompts SET ${setClauses.join(', ')} WHERE id = $${idx}`,
    values,
  );
}

export async function dbDeletePrompt(id: string): Promise<void> {
  if (!isTauri()) return;
  const database = await getDatabase();
  if (!database) return;

  await database.execute('DELETE FROM prompts WHERE id = $1', [id]);
}

// ================================================================
//  SESSION LOGS
// ================================================================

export async function dbAddLog(sessionId: string, logType: string, content: string): Promise<void> {
  if (!isTauri()) return;
  const database = await getDatabase();
  if (!database) return;

  const now = new Date().toISOString();
  await database.execute(
    `INSERT INTO session_logs (session_id, log_type, content, timestamp)
     VALUES ($1, $2, $3, $4)`,
    [sessionId, logType, content, now],
  );
}

export async function dbGetLogs(sessionId: string, limit = 500): Promise<LogEntry[]> {
  if (!isTauri()) return [];
  const database = await getDatabase();
  if (!database) return [];

  const rows = await database.select<LogRow[]>(
    'SELECT * FROM session_logs WHERE session_id = $1 ORDER BY timestamp ASC LIMIT $2',
    [sessionId, limit],
  );
  return rows.map(mapLogRow);
}
