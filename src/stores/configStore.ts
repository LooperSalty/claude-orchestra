import { create } from 'zustand';
import type { AppConfig, ThemeName } from '@/types/config';

interface ConfigState {
  config: AppConfig;
  isLoaded: boolean;
}

interface ConfigActions {
  setConfig: (config: AppConfig) => void;
  updateConfig: <K extends keyof AppConfig>(
    section: K,
    updates: Partial<AppConfig[K]>
  ) => void;
  setTheme: (theme: ThemeName) => void;
}

const DEFAULT_CONFIG: AppConfig = {
  general: {
    defaultWorkDir: '',
    theme: 'midnight',
    language: 'fr',
  },
  models: {
    defaultModel: 'claude-sonnet-4-6',
    fallbackModel: 'claude-haiku-4-5-20251001',
    maxTokensDefault: 8192,
  },
  security: {
    autoApproveTools: [],
    skipPermissions: false,
    sandboxMode: true,
  },
  network: {
    allowedDomains: [],
    timeout: 30000,
  },
  storage: {
    dbPath: '',
    logRetentionDays: 30,
    autoBackup: false,
  },
};

export const useConfigStore = create<ConfigState & ConfigActions>((set) => ({
  config: DEFAULT_CONFIG,
  isLoaded: false,

  setConfig: (config) => set({ config, isLoaded: true }),

  updateConfig: (section, updates) =>
    set((state) => ({
      config: {
        ...state.config,
        [section]: { ...state.config[section], ...updates },
      },
    })),

  setTheme: (theme) =>
    set((state) => ({
      config: {
        ...state.config,
        general: { ...state.config.general, theme },
      },
    })),
}));
