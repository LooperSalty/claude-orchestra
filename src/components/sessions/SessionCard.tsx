import { memo } from 'react';
import { motion } from 'framer-motion';
import { Play, Square, RotateCcw, Terminal as TerminalIcon, Maximize2 } from 'lucide-react';
import type { Session } from '@/types/session';

interface SessionCardProps {
  session: Session;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onOpenTerminal: () => void;
  onStop: () => void;
  onRestart: () => void;
}

const cardVariants = {
  initial: { opacity: 0, scale: 0.95, y: 15 },
  animate: (i: number) => ({
    opacity: 1, scale: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as const },
  }),
};

function getStatusStyle(status: string) {
  switch (status) {
    case 'running':
      return { bg: 'var(--accent-success)', glow: 'var(--accent-success-glow)', label: 'Running' };
    case 'error':
      return { bg: 'var(--accent-error)', glow: 'var(--accent-error-glow)', label: 'Error' };
    case 'paused':
      return { bg: 'var(--accent-warning)', glow: 'var(--accent-warning-glow)', label: 'Paused' };
    default:
      return { bg: 'var(--text-ghost)', glow: 'transparent', label: 'Stopped' };
  }
}

function formatUptime(startedAt?: string): string {
  if (!startedAt) return '—';
  const start = new Date(startedAt).getTime();
  const diff = Date.now() - start;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m`;
}

export const SessionCard = memo(function SessionCard({
  session, index, isSelected, onSelect, onOpenTerminal, onStop, onRestart,
}: SessionCardProps) {
  const status = getStatusStyle(session.status);

  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="initial"
      animate="animate"
      onClick={onSelect}
      className={`rounded-xl border p-4 space-y-3 cursor-pointer transition-all duration-200 ${
        session.status === 'running' ? 'glow-green' : ''
      }`}
      style={{
        background: isSelected ? 'var(--bg-elevated)' : 'var(--bg-surface)',
        borderColor: isSelected ? 'var(--accent-primary)' : 'var(--border-subtle)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              session.status === 'running' ? 'pulse-running' : ''
            }`}
            style={{ background: status.bg }}
          />
          <span className="text-sm font-medium mono" style={{ color: 'var(--text-primary)' }}>
            {session.id.slice(0, 8)}
          </span>
        </div>
        <span
          className="text-caption px-2 py-0.5 rounded-full"
          style={{ background: status.glow, color: status.bg }}
        >
          {status.label}
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 text-small" style={{ color: 'var(--text-secondary)' }}>
        <div>
          <span style={{ color: 'var(--text-ghost)' }}>Model </span>
          <span className="mono">{session.model.replace('claude-', '')}</span>
        </div>
        <div>
          <span style={{ color: 'var(--text-ghost)' }}>Tokens </span>
          <span className="mono">{session.totalTokensUsed.toLocaleString()}</span>
        </div>
        <div>
          <span style={{ color: 'var(--text-ghost)' }}>Cost </span>
          <span className="mono">${(session.totalCostCents / 100).toFixed(2)}</span>
        </div>
        <div>
          <span style={{ color: 'var(--text-ghost)' }}>Uptime </span>
          <span className="mono">{formatUptime(session.startedAt)}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-1.5">
        <button
          onClick={(e) => { e.stopPropagation(); onOpenTerminal(); }}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs transition-colors"
          style={{ background: 'var(--bg-hover)', color: 'var(--accent-primary)' }}
          title="Open terminal"
        >
          <TerminalIcon size={12} /> Terminal
        </button>
        {session.status === 'running' ? (
          <button
            onClick={(e) => { e.stopPropagation(); onStop(); }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs transition-colors"
            style={{ background: 'var(--bg-hover)', color: 'var(--accent-error)' }}
          >
            <Square size={12} /> Stop
          </button>
        ) : (
          <button
            onClick={(e) => { e.stopPropagation(); onRestart(); }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs transition-colors"
            style={{ background: 'var(--bg-hover)', color: 'var(--accent-success)' }}
          >
            <Play size={12} /> Start
          </button>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); onRestart(); }}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs transition-colors"
          style={{ background: 'var(--bg-hover)', color: 'var(--text-tertiary)' }}
        >
          <RotateCcw size={12} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onOpenTerminal(); }}
          className="ml-auto flex items-center px-2 py-1.5 rounded-lg text-xs transition-colors"
          style={{ background: 'var(--bg-hover)', color: 'var(--text-tertiary)' }}
          title="Fullscreen"
        >
          <Maximize2 size={12} />
        </button>
      </div>
    </motion.div>
  );
});
