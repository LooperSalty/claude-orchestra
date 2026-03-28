export interface Plugin {
  id: string;
  name: string;
  type: 'mcp_server' | 'extension' | 'tool';
  url?: string;
  description?: string;
  status: PluginStatus;
  config: Record<string, unknown>;
  installedAt: string;
}

export type PluginStatus = 'connected' | 'disconnected' | 'error';

export const PLUGIN_STATUS_COLORS: Record<PluginStatus, string> = {
  connected: 'var(--accent-success)',
  disconnected: 'var(--text-tertiary)',
  error: 'var(--accent-error)',
};
