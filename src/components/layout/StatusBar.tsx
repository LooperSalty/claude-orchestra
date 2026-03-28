import { useSessionStore } from '@/stores/sessionStore';
import { useMetricsStore } from '@/stores/metricsStore';

export function StatusBar() {
  const activeSessions = useSessionStore((s) =>
    s.sessions.filter((sess) => sess.status === 'running').length
  );
  const stats = useMetricsStore((s) => s.stats);
  const now = new Date();
  const time = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  return (
    <footer
      className="flex items-center justify-between h-6 px-4 text-[10px] font-mono border-t shrink-0"
      style={{
        background: 'var(--bg-1)',
        borderColor: 'var(--border-0)',
        color: 'var(--text-4)',
      }}
    >
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1.5">
          <span
            className={`w-[5px] h-[5px] rounded-full ${activeSessions > 0 ? 'status-live' : 'status-idle'}`}
          />
          {activeSessions} active
        </span>
        <span>{stats.totalTokensToday.toLocaleString()} tok</span>
        <span>${(stats.totalCostToday / 100).toFixed(2)}</span>
      </div>
      <div className="flex items-center gap-3">
        <span>{time}</span>
        <span style={{ color: 'var(--text-4)' }}>v0.1.0</span>
      </div>
    </footer>
  );
}
