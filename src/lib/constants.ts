export const APP_NAME = 'Claude Orchestra';
export const APP_VERSION = '0.1.0';

export const NAVIGATION_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { id: 'sessions', label: 'Sessions', icon: 'Terminal' },
  { id: 'agents', label: 'Agents', icon: 'Bot' },
  { id: 'memory', label: 'Memory', icon: 'Brain' },
  { id: 'skills', label: 'Skills', icon: 'Sparkles' },
  { id: 'plugins', label: 'Plugins', icon: 'Plug' },
  { id: 'metrics', label: 'Metrics', icon: 'BarChart3' },
  { id: 'config', label: 'Config', icon: 'Settings' },
] as const;

export const KEYBOARD_SHORTCUTS = {
  commandPalette: 'Ctrl+K',
  newSession: 'Ctrl+N',
  splitHorizontal: 'Ctrl+Shift+H',
  splitVertical: 'Ctrl+Shift+V',
  closePanel: 'Ctrl+W',
  settings: 'Ctrl+,',
  pluginManager: 'Ctrl+Shift+P',
  skillsBrowser: 'Ctrl+Shift+S',
  memoryExplorer: 'Ctrl+Shift+M',
  fullscreen: 'F11',
} as const;

export const STATUS_COLORS: Record<string, string> = {
  running: 'var(--accent-success)',
  stopped: 'var(--text-tertiary)',
  error: 'var(--accent-error)',
  paused: 'var(--accent-warning)',
};
