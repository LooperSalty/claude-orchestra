import { invoke } from '@tauri-apps/api/core';
import type { Session, Project } from '@/types/session';
import type { Skill } from '@/types/skill';
import type { ApiKeyInfo, AccountInfo } from '@/types/auth';

// Sessions
export async function listSessions(): Promise<Session[]> {
  return invoke('list_sessions');
}

export async function createSession(config: {
  projectPath: string;
  model?: string;
  agentId?: string;
  extraArgs?: string[];
}): Promise<Session> {
  return invoke('create_session', {
    config: {
      project_path: config.projectPath,
      model: config.model,
      agent_id: config.agentId,
      extra_args: config.extraArgs ?? [],
    },
  });
}

export async function stopSession(sessionId: string): Promise<void> {
  return invoke('stop_session', { sessionId });
}

export async function getSession(sessionId: string): Promise<Session | null> {
  return invoke('get_session', { sessionId });
}

// Processes
export async function spawnProcess(
  sessionId: string,
  projectPath: string,
  model?: string,
  extraArgs: string[] = []
): Promise<{ pid: number; sessionId: string; alive: boolean }> {
  return invoke('spawn_process', { sessionId, projectPath, model, extraArgs });
}

export async function killProcess(sessionId: string): Promise<void> {
  return invoke('kill_process', { sessionId });
}

export async function sendInput(sessionId: string, message: string): Promise<void> {
  return invoke('send_input', { sessionId, message });
}

// Filesystem
export async function scanProjects(basePaths: string[]): Promise<Project[]> {
  return invoke('scan_projects', { basePaths });
}

export async function readClaudeMd(projectPath: string): Promise<string | null> {
  return invoke('read_claude_md', { projectPath });
}

export async function writeClaudeMd(projectPath: string, content: string): Promise<void> {
  return invoke('write_claude_md', { projectPath, content });
}

export async function scanSkills(skillsPaths: string[]): Promise<Skill[]> {
  return invoke('scan_skills', { skillsPaths });
}

// Config
export async function getConfig(): Promise<{
  claudeCodePath: string | null;
  claudeCodeVersion: string | null;
  homeDir: string;
  claudeDir: string;
  settingsPath: string;
}> {
  return invoke('get_config');
}

export async function detectClaudeCode(): Promise<boolean> {
  return invoke('detect_claude_code');
}

// Auth
export async function validateApiKey(key: string): Promise<ApiKeyInfo> {
  if (!isTauri()) {
    return mockValidateApiKey(key);
  }
  return invoke('validate_api_key', { key });
}

export async function saveApiKey(key: string): Promise<void> {
  if (!isTauri()) {
    localStorage.setItem('claude-orchestra-api-key', key);
    return;
  }
  return invoke('save_api_key', { key });
}

export async function getApiKey(): Promise<string | null> {
  if (!isTauri()) {
    return localStorage.getItem('claude-orchestra-api-key');
  }
  return invoke('get_api_key');
}

export async function deleteApiKey(): Promise<void> {
  if (!isTauri()) {
    localStorage.removeItem('claude-orchestra-api-key');
    return;
  }
  return invoke('delete_api_key');
}

export async function getAccountInfo(key: string): Promise<AccountInfo> {
  if (!isTauri()) {
    return mockGetAccountInfo();
  }
  return invoke('get_account_info', { key });
}

// Helpers

function isTauri(): boolean {
  return '__TAURI_INTERNALS__' in window;
}

function mockValidateApiKey(key: string): Promise<ApiKeyInfo> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const valid = key.startsWith('sk-ant-');
      resolve({
        valid,
        models: valid
          ? ['claude-sonnet-4-20250514', 'claude-haiku-4-5-20251001', 'claude-opus-4-20250514']
          : [],
      });
    }, 1200);
  });
}

function mockGetAccountInfo(): Promise<AccountInfo> {
  return Promise.resolve({
    models: [
      { id: 'claude-sonnet-4-20250514', displayName: 'Claude Sonnet 4' },
      { id: 'claude-haiku-4-5-20251001', displayName: 'Claude Haiku 4.5' },
      { id: 'claude-opus-4-20250514', displayName: 'Claude Opus 4' },
    ],
  });
}
