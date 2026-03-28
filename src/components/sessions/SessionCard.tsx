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
      return { color: 'var(--green)', glow: 'card-glow-green', label: 'Running' };
    case 'error':
      return { color: 'var(--red)', glow: '', label: 'Error' };
    case 'paused':
      return { color: 'var(--amber)', glow: '', label: 'Paused' };
    default:
      return { color: 'var(--text-4)', glow: '', label: 'Stopped' };
  }
}

function formatUptime(startedAt?: string): string {
  if (!startedAt) return '\u2014';
  const start = new Date(startedAt).getTime();
  const diff = Date.now() - start;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m`;
}

function ActionButton({ onClick, color, children, title }: {
  onClick: (e: React.MouseEvent) => void; color: string; children: React.ReactNode; title?: string;
}) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(e); }}
      className="flex items-center gap-1.5 transition-all"
      title={title}
      style={{
        padding: '6px 10px', borderRadius: 8, fontSize: 11,
        background: 'var(--bg-4)', color,
        border: '1px solid var(--border-0)',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-hover)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg-4)'; }}
    >
      {children}
    </button>
  );
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
      className={`card ${status.glow}`}
      style={{
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        background: isSelected ? 'var(--bg-3)' : 'var(--bg-2)',
        borderLeft: `3px solid ${status.color}`,
        borderColor: isSelected ? 'var(--cyan)' : undefined,
        padding: 0,
        overflow: 'hidden',
      }}
    >
      <div style={{ padding: '18px 18px 16px' }}>
        {/* Header */}
        <div className="flex items-center justify-between" style={{ marginBottom: 14 }}>
          <div className="flex items-center gap-2.5">
            <span
              className={session.status === 'running' ? 'status-live' : ''}
              style={{
                width: 9, height: 9, borderRadius: '50%', display: 'inline-block', flexShrink: 0,
                background: status.color,
                boxShadow: session.status === 'running' ? `0 0 10px var(--green)` : 'none',
              }}
            />
            <span className="font-mono font-semibold" style={{ color: 'var(--text-0)', fontSize: 14 }}>
              {session.id.slice(0, 8)}
            </span>
          </div>
          <span
            className="font-mono"
            style={{
              fontSize: 10, padding: '3px 10px', borderRadius: 20,
              background: `${status.color}15`, color: status.color,
              fontWeight: 600, letterSpacing: 0.3,
            }}
          >
            {status.label}
          </span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2" style={{ gap: '10px 16px' }}>
          {[
            { label: 'Model', value: session.model.replace('claude-', ''), isBadge: true },
            { label: 'Tokens', value: session.totalTokensUsed.toLocaleString() },
            { label: 'Cost', value: `$${(session.totalCostCents / 100).toFixed(2)}` },
            { label: 'Uptime', value: formatUptime(session.startedAt) },
          ].map((stat) => (
            <div key={stat.label}>
              <div style={{ color: 'var(--text-4)', fontSize: 10, marginBottom: 2 }}>{stat.label}</div>
              {stat.isBadge ? (
                <span className="font-mono" style={{
                  fontSize: 11, padding: '2px 8px', borderRadius: 6,
                  background: 'var(--bg-4)', color: 'var(--text-1)',
                  display: 'inline-block',
                }}>
                  {stat.value}
                </span>
              ) : (
                <div className="font-mono" style={{ color: 'var(--text-1)', fontSize: 12 }}>{stat.value}</div>
              )}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex" style={{ gap: 6, marginTop: 16 }}>
          <ActionButton onClick={onOpenTerminal} color="var(--cyan)" title="Open terminal">
            <TerminalIcon size={12} /> Terminal
          </ActionButton>
          {session.status === 'running' ? (
            <ActionButton onClick={onStop} color="var(--red)">
              <Square size={12} /> Stop
            </ActionButton>
          ) : (
            <ActionButton onClick={onRestart} color="var(--green)">
              <Play size={12} /> Start
            </ActionButton>
          )}
          <ActionButton onClick={onRestart} color="var(--text-3)">
            <RotateCcw size={12} />
          </ActionButton>
          <div style={{ flex: 1 }} />
          <ActionButton onClick={onOpenTerminal} color="var(--text-3)" title="Fullscreen">
            <Maximize2 size={12} />
          </ActionButton>
        </div>
      </div>
    </motion.div>
  );
});
