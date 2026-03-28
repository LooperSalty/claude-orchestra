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
    session.status === 'running' ? 'var(--green)' :
    session.status === 'error' ? 'var(--red)' :
    'var(--text-4)';

  return (
    <div
      className="flex flex-col rounded-xl border overflow-hidden h-full"
      style={{
        background: 'var(--bg-2)',
        borderColor: session.status === 'running' ? 'rgba(0, 255, 136, 0.2)' : 'var(--border-0)',
      }}
    >
      {/* Title bar */}
      <div
        className="flex items-center justify-between px-4 py-2.5 border-b shrink-0"
        style={{ borderColor: 'var(--border-0)', background: 'var(--bg-3)' }}
      >
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${session.status === 'running' ? 'status-live' : ''}`}
            style={{ background: statusColor }}
          />
          <span className="text-small font-medium mono" style={{ color: 'var(--text-0)' }}>
            Session {session.id.slice(0, 8)}
          </span>
          <span className="text-caption" style={{ color: 'var(--text-4)' }}>
            {session.model.replace('claude-', '')}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {onMinimize && (
            <button
              onClick={onMinimize}
              className="p-1.5 rounded-lg transition-colors"
              style={{ color: 'var(--text-3)', background: 'transparent', border: 'none', cursor: 'pointer' }}
            >
              <Minus size={14} />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: 'var(--text-3)', background: 'transparent', border: 'none', cursor: 'pointer' }}
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
