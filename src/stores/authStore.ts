import { create } from 'zustand';
import type { AuthStatus } from '@/types/auth';
import {
  validateApiKey,
  saveApiKey,
  getApiKey,
  deleteApiKey,
} from '@/lib/tauri';

interface AuthState {
  status: AuthStatus;
  apiKey: string | null;
  models: string[];
  error: string | null;
  claudeCodeDetected: boolean;
}

interface AuthActions {
  checkExistingKey: () => Promise<void>;
  validateAndSave: (key: string) => Promise<boolean>;
  logout: () => Promise<void>;
  setStatus: (status: AuthStatus) => void;
  setClaudeCodeDetected: (detected: boolean) => void;
}

export const useAuthStore = create<AuthState & AuthActions>((set) => ({
  status: 'unchecked',
  apiKey: null,
  models: [],
  error: null,
  claudeCodeDetected: false,

  checkExistingKey: async () => {
    try {
      const key = await getApiKey();
      if (key === null) {
        set({ status: 'no_key', apiKey: null });
        return;
      }

      set({ status: 'validating' });
      const info = await validateApiKey(key);

      if (info.valid) {
        set({ status: 'valid', apiKey: key, models: info.models, error: null });
      } else {
        set({ status: 'invalid', apiKey: null, error: 'Stored key is no longer valid' });
      }
    } catch (err) {
      set({
        status: 'no_key',
        apiKey: null,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  },

  validateAndSave: async (key: string) => {
    set({ status: 'validating', error: null });
    try {
      const info = await validateApiKey(key);

      if (!info.valid) {
        set({ status: 'invalid', error: 'Invalid API key' });
        return false;
      }

      await saveApiKey(key);
      set({ status: 'valid', apiKey: key, models: info.models, error: null });
      return true;
    } catch (err) {
      set({
        status: 'invalid',
        error: err instanceof Error ? err.message : String(err),
      });
      return false;
    }
  },

  logout: async () => {
    try {
      await deleteApiKey();
    } catch {
      // Ignore deletion errors
    }
    set({ status: 'no_key', apiKey: null, models: [], error: null });
  },

  setStatus: (status) => set({ status }),

  setClaudeCodeDetected: (detected) => set({ claudeCodeDetected: detected }),
}));
