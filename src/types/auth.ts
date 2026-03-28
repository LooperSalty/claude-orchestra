export interface ApiKeyInfo {
  valid: boolean;
  models: string[];
}

export interface AccountInfo {
  models: ModelInfo[];
}

export interface ModelInfo {
  id: string;
  displayName: string;
}

export type AuthStatus = 'unchecked' | 'validating' | 'valid' | 'invalid' | 'no_key';
