import { useSessionStore } from '@/stores/sessionStore';
import { useMetricsStore } from '@/stores/metricsStore';
import { Activity, Coins, Zap, Clock } from 'lucide-react';
import { APP_VERSION } from '@/lib/constants';

export function StatusBar() {
  const activeSessions = useSessionStore((s) =>
    s.sessions.filter((sess) => sess.status === 'running').length
  );
  const stats = useMetricsStore((s) => s.stats);

  const now = new Date();
  const time = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  return (
    <footer
      className="flex items-center justify-between h-7 px-4 text-xs border-t shrink-0"
      style={{
        background: 'var(--bg-surface)',
        borderColor: 'var(--border-subtle)',
        color: 'var(--text-tertiary)',
      }}
    >
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1.5">
          <span
            className="w-2 h-2 rounded-full"
            style={{
              background: activeSessions > 0 ? 'var(--accent-success)' : 'var(--text-ghost)',
            }}
          />
          {activeSessions} active
        </span>
        <span className="flex items-center gap-1">
          <Activity size={11} />
          {stats.totalTokensToday.toLocaleString()} tokens
        </span>
        <span className="flex items-center gap-1">
          <Coins size={11} />
          ${(stats.totalCostToday / 100).toFixed(2)}
        </span>
        <span className="flex items-center gap-1">
          <Zap size={11} />
          {stats.avgLatency}ms
        </span>
      </div>

      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1">
          <Clock size={11} />
          {time}
        </span>
        <span style={{ color: 'var(--text-ghost)' }}>v{APP_VERSION}</span>
      </div>
    </footer>
  );
}
