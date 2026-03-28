import { useCallback } from 'react';
import { useSessionStore } from '@/stores/sessionStore';
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
      const onOutput = new Channel<SessionOutput>();
      onOutput.onmessage = (output: SessionOutput) => {
        // Dispatch to the terminal via CustomEvent
        window.dispatchEvent(new CustomEvent(`session-output-${sessionId}`, {
          detail: output,
        }));
      };

      const result = await invoke<{ pid: number; session_id: string }>('spawn_process', {
        onOutput,
        sessionId,
        projectPath,
        model,
        extraArgs,
      });
      updateSession(sessionId, { pid: result.pid });
    } catch (err) {
      console.error('Spawn error:', err);
      // Browser mode — simulate with demo output
      updateSession(sessionId, { pid: 99999 });
      simulateOutput(sessionId);
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
  }, [appendLog]);

  // Simulate output for browser dev mode
  function simulateOutput(sessionId: string) {
    const lines = [
      '\x1b[90m[Orchestra] Browser mode — simulated session\x1b[0m\r\n',
      '\r\n',
      '\x1b[1;36m●\x1b[0m Claude Code starting...\r\n',
      '\x1b[90m  Model: claude-sonnet-4-6\x1b[0m\r\n',
      '\x1b[90m  Context: 1M tokens\x1b[0m\r\n',
      '\r\n',
      '\x1b[32m✓\x1b[0m Session ready. Waiting for input...\r\n',
      '\r\n',
      '\x1b[1;37m>\x1b[0m ',
    ];

    lines.forEach((line, i) => {
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent(`session-output-${sessionId}`, {
          detail: { content: line, log_type: 'stdout' },
        }));
      }, i * 200);
    });
  }

  return { createSession, stopSession, sendToSession };
}
