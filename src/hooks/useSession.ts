import { useCallback } from 'react';
import { useSessionStore } from '@/stores/sessionStore';
import { useChatStore } from '@/stores/chatStore';
import type { Session } from '@/types/session';

interface SessionOutput {
  content: string;
  log_type: string;
}

export function useSession() {
  const { addSession, updateSession, appendLog } = useSessionStore();

  const createSession = useCallback(async (projectPath: string, model: string, extraArgs: string[] = []) => {
    const sessionId = crypto.randomUUID();
    const now = new Date().toISOString();

    const session: Session = {
      id: sessionId,
      projectId: '',
      status: 'running',
      startedAt: now,
      totalTokensUsed: 0,
      totalCostCents: 0,
      model,
      configOverride: {},
      createdAt: now,
    };

    addSession(session);

    // Try to spawn via Tauri with Channel API
    try {
      const { invoke, Channel } = await import('@tauri-apps/api/core');

      // Create a channel for streaming PTY output
      console.log('[ORCHESTRA-FE] Creating channel for session', sessionId);

      const onOutput = new Channel<SessionOutput>();
      onOutput.onmessage = (output: SessionOutput) => {
        console.log('[ORCHESTRA-FE] Channel received:', output.log_type, output.content.slice(0, 80));
        window.dispatchEvent(new CustomEvent(`session-output-${sessionId}`, {
          detail: output,
        }));
      };

      console.log('[ORCHESTRA-FE] Invoking spawn_process...');
      const result = await invoke<{ pid: number; session_id: string }>('spawn_process', {
        onOutput,
        sessionId,
        projectPath,
        model,
        extraArgs,
      });
      console.log('[ORCHESTRA-FE] spawn_process returned:', result);
      updateSession(sessionId, { pid: result.pid });
    } catch (err) {
      console.error('[ORCHESTRA-FE] Spawn error:', err);
      // Show error in terminal
      window.dispatchEvent(new CustomEvent(`session-output-${sessionId}`, {
        detail: { content: `\x1b[31m[Orchestra] Error: ${String(err)}\x1b[0m\r\n`, log_type: 'stderr' },
      }));
      // Browser mode — simulate with demo output
      updateSession(sessionId, { pid: 99999 });
    }

    return sessionId;
  }, [addSession, updateSession]);

  const stopSession = useCallback(async (sessionId: string) => {
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      await invoke('kill_process', { sessionId });
    } catch {
      // Browser mode
    }
    updateSession(sessionId, { status: 'stopped', endedAt: new Date().toISOString() });
  }, [updateSession]);

  const sendToSession = useCallback(async (sessionId: string, message: string) => {
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      await invoke('send_input', { sessionId, message });
    } catch {
      // Browser mode
    }
    appendLog(sessionId, {
      id: Date.now(),
      sessionId,
      logType: 'stdin',
      content: message,
      timestamp: new Date().toISOString(),
    });

    // Flush any pending assistant content before the user message
    const chatStore = useChatStore.getState();
    chatStore.flushAssistant(sessionId);
  }, [appendLog]);

  return { createSession, stopSession, sendToSession };
}
