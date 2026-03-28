export interface AppConfig {
  general: GeneralConfig;
  models: ModelConfig;
  security: SecurityConfig;
  network: NetworkConfig;
  storage: StorageConfig;
}

export interface GeneralConfig {
  defaultWorkDir: string;
  theme: ThemeName;
  language: string;
}

export interface ModelConfig {
  defaultModel: string;
  fallbackModel: string;
  maxTokensDefault: number;
}

export interface SecurityConfig {
  autoApproveTools: string[];
  skipPermissions: boolean;
  sandboxMode: boolean;
}

export interface NetworkConfig {
  proxy?: string;
  allowedDomains: string[];
  timeout: number;
}

export interface StorageConfig {
  dbPath: string;
  logRetentionDays: number;
  autoBackup: boolean;
}

export type ThemeName = 'midnight' | 'cyberpunk' | 'paper';

export type NavigationPage =
  | 'dashboard'
  | 'sessions'
  | 'agents'
  | 'memory'
  | 'skills'
  | 'plugins'
  | 'metrics'
  | 'config';
