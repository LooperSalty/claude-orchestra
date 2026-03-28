import { useSessionStore } from '@/stores/sessionStore';
import { useMetricsStore } from '@/stores/metricsStore';

function Separator() {
  return (
    <span style={{
      width: 3, height: 3, borderRadius: '50%',
      background: 'var(--text-4)', opacity: 0.4,
      display: 'inline-block', flexShrink: 0,
    }} />
  );
}

export function StatusBar() {
  const activeSessions = useSessionStore((s) =>
    s.sessions.filter((sess) => sess.status === 'running').length
  );
  const stats = useMetricsStore((s) => s.stats);
  const now = new Date();
  const time = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  return (
    <footer
      className="flex items-center justify-between shrink-0 font-mono"
      style={{
        height: 30, paddingInline: 16, fontSize: 10,
        background: 'var(--bg-1)', borderTop: '1px solid var(--border-0)',
        color: 'var(--text-4)',
      }}
    >
      <div className="flex items-center" style={{ gap: 12 }}>
        <span className="flex items-center" style={{ gap: 6 }}>
          <span
            style={{
              width: 6, height: 6, borderRadius: '50%', display: 'inline-block', flexShrink: 0,
              background: activeSessions > 0 ? 'var(--green)' : 'var(--text-4)',
              boxShadow: activeSessions > 0 ? '0 0 8px var(--green)' : 'none',
              animation: activeSessions > 0 ? 'pulse 2s ease-in-out infinite' : 'none',
            }}
          />
          <span style={{ color: activeSessions > 0 ? 'var(--text-2)' : 'var(--text-4)' }}>
            {activeSessions} active
          </span>
        </span>
        <Separator />
        <span>{stats.totalTokensToday.toLocaleString()} tok</span>
        <Separator />
        <span>${(stats.totalCostToday / 100).toFixed(2)}</span>
      </div>
      <div className="flex items-center" style={{ gap: 12 }}>
        <span>{time}</span>
        <Separator />
        <span>v0.1.0</span>
      </div>
    </footer>
  );
}
