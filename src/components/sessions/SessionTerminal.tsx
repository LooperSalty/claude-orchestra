import { Terminal } from '../shared/Terminal';
import { X, Minus } from 'lucide-react';
import type { Session } from '@/types/session';

interface SessionTerminalProps {
  session: Session;
  onClose: () => void;
  onMinimize?: () => void;
}

export function SessionTerminal({ session, onClose, onMinimize }: SessionTerminalProps) {
  async function handleInput(data: string) {
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      await invoke('send_input', { sessionId: session.id, message: data });
    } catch {
      // Browser mode
    }
  }

  const statusColor =
    session.status === 'running' ? 'var(--accent-success)' :
    session.status === 'error' ? 'var(--accent-error)' :
    'var(--text-ghost)';

  return (
    <div
      className="flex flex-col rounded-xl border overflow-hidden h-full"
      style={{
        background: 'var(--bg-surface)',
        borderColor: session.status === 'running' ? 'var(--accent-success)' : 'var(--border-subtle)',
      }}
    >
      {/* Title bar */}
      <div
        className="flex items-center justify-between px-3 py-2 border-b shrink-0"
        style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-elevated)' }}
      >
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${session.status === 'running' ? 'pulse-running' : ''}`}
            style={{ background: statusColor }}
          />
          <span className="text-small font-medium mono" style={{ color: 'var(--text-primary)' }}>
            Session {session.id.slice(0, 8)}
          </span>
          <span className="text-caption" style={{ color: 'var(--text-ghost)' }}>
            {session.model.replace('claude-', '')}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {onMinimize && (
            <button
              onClick={onMinimize}
              className="p-1 rounded transition-colors"
              style={{ color: 'var(--text-tertiary)' }}
            >
              <Minus size={14} />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 rounded transition-colors"
            style={{ color: 'var(--text-tertiary)' }}
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Terminal */}
      <div className="flex-1 p-1">
        <Terminal sessionId={session.id} onData={handleInput} />
      </div>
    </div>
  );
}
