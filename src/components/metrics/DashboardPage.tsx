import { motion } from 'framer-motion';
import { Activity, Terminal, Coins, Zap, TrendingUp } from 'lucide-react';
import { useSessionStore } from '@/stores/sessionStore';
import { useMetricsStore } from '@/stores/metricsStore';

const cardVariants = {
  initial: { opacity: 0, scale: 0.95, y: 15 },
  animate: (i: number) => ({
    opacity: 1, scale: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as const },
  }),
};

interface StatCardProps {
  index: number;
  icon: React.ElementType;
  label: string;
  value: string;
  accent: string;
  sub?: string;
}

function StatCard({ index, icon: Icon, label, value, accent, sub }: StatCardProps) {
  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="initial"
      animate="animate"
      className="rounded-xl border p-4 relative overflow-hidden"
      style={{
        background: 'var(--bg-surface)',
        borderColor: 'var(--border-subtle)',
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: `${accent}20`, color: accent }}
        >
          <Icon size={16} />
        </div>
        <span className="text-caption" style={{ color: 'var(--text-tertiary)' }}>
          {label}
        </span>
      </div>
      <div className="text-h2" style={{ color: 'var(--text-primary)' }}>
        {value}
      </div>
      {sub && (
        <div className="text-small mt-1" style={{ color: 'var(--text-tertiary)' }}>
          {sub}
        </div>
      )}
    </motion.div>
  );
}

export function DashboardPage() {
  const sessions = useSessionStore((s) => s.sessions);
  const stats = useMetricsStore((s) => s.stats);
  const activeSessions = sessions.filter((s) => s.status === 'running').length;

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-h1" style={{ color: 'var(--text-primary)' }}>
          Dashboard
        </h1>
        <p className="text-body mt-1" style={{ color: 'var(--text-secondary)' }}>
          Vue d'ensemble de Claude Orchestra
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          index={0}
          icon={Terminal}
          label="Sessions actives"
          value={String(activeSessions)}
          accent="var(--accent-success)"
          sub={`${sessions.length} total`}
        />
        <StatCard
          index={1}
          icon={Activity}
          label="Tokens aujourd'hui"
          value={stats.totalTokensToday.toLocaleString()}
          accent="var(--accent-primary)"
        />
        <StatCard
          index={2}
          icon={Coins}
          label="Coût aujourd'hui"
          value={`$${(stats.totalCostToday / 100).toFixed(2)}`}
          accent="var(--accent-warning)"
        />
        <StatCard
          index={3}
          icon={Zap}
          label="Latence moyenne"
          value={`${stats.avgLatency}ms`}
          accent="var(--accent-cyan)"
        />
      </div>

      {/* Empty state */}
      {sessions.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border p-12 text-center"
          style={{
            background: 'var(--bg-surface)',
            borderColor: 'var(--border-subtle)',
          }}
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{
              background: 'var(--accent-primary-glow)',
              color: 'var(--accent-primary)',
            }}
          >
            <TrendingUp size={28} />
          </div>
          <h3 className="text-h3 mb-2" style={{ color: 'var(--text-primary)' }}>
            Bienvenue sur Claude Orchestra
          </h3>
          <p className="text-body mb-4" style={{ color: 'var(--text-secondary)' }}>
            Commencez par créer votre première session Claude Code.
          </p>
          <p className="text-small" style={{ color: 'var(--text-tertiary)' }}>
            Ctrl+N pour créer une session · Ctrl+K pour la palette de commandes
          </p>
        </motion.div>
      )}

      {/* Recent activity placeholder */}
      {sessions.length > 0 && (
        <div
          className="rounded-xl border p-6"
          style={{
            background: 'var(--bg-surface)',
            borderColor: 'var(--border-subtle)',
          }}
        >
          <h2 className="text-h3 mb-4" style={{ color: 'var(--text-primary)' }}>
            Sessions récentes
          </h2>
          <div className="space-y-2">
            {sessions.slice(0, 5).map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between py-2 px-3 rounded-lg"
                style={{ background: 'var(--bg-elevated)' }}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{
                      background:
                        session.status === 'running'
                          ? 'var(--accent-success)'
                          : session.status === 'error'
                          ? 'var(--accent-error)'
                          : 'var(--text-ghost)',
                    }}
                  />
                  <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                    Session {session.id.slice(0, 8)}
                  </span>
                </div>
                <span className="text-small" style={{ color: 'var(--text-tertiary)' }}>
                  {session.totalTokensUsed.toLocaleString()} tokens
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
