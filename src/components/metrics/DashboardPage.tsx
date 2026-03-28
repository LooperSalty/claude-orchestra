import { motion } from 'framer-motion';
import { Activity, Terminal, Coins, Zap, ArrowUpRight, Sparkles, TrendingUp } from 'lucide-react';
import { useSessionStore } from '@/stores/sessionStore';
import { useMetricsStore } from '@/stores/metricsStore';
import { useUIStore } from '@/stores/uiStore';

const stagger = {
  animate: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } },
};

interface StatProps {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  accent: string;
}

function Stat({ icon: Icon, label, value, sub, accent }: StatProps) {
  return (
    <motion.div
      variants={fadeUp}
      className="card card-glow-cyan"
      style={{ padding: '28px 24px' }}
    >
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: `${accent}15`, color: accent }}
          >
            <Icon size={18} strokeWidth={2} />
          </div>
          <ArrowUpRight size={13} style={{ color: 'var(--text-4)' }} />
        </div>
        <div
          className="font-display text-4xl font-extrabold tracking-tight"
          style={{ color: 'var(--text-0)' }}
        >
          {value}
        </div>
        <div className="text-[12px] font-medium mt-2" style={{ color: 'var(--text-3)' }}>
          {label}
        </div>
        {sub && (
          <div className="text-[10px] font-mono mt-2" style={{ color: 'var(--text-4)' }}>
            {sub}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function DashboardPage() {
  const sessions = useSessionStore((s) => s.sessions);
  const stats = useMetricsStore((s) => s.stats);
  const setPage = useUIStore((s) => s.setPage);
  const activeSessions = sessions.filter((s) => s.status === 'running').length;

  return (
    <motion.div
      variants={stagger}
      initial="initial"
      animate="animate"
      className="max-w-[1100px] mx-auto"
      style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}
    >
      {/* ── Header ── */}
      <motion.div variants={fadeUp} style={{ paddingTop: '8px' }}>
        <h1
          className="font-display font-bold tracking-tight"
          style={{ color: 'var(--text-0)', fontSize: '2rem', lineHeight: 1.1 }}
        >
          Dashboard
        </h1>
        <p className="text-[13px] mt-3" style={{ color: 'var(--text-3)' }}>
          Claude Orchestra — control center
        </p>
      </motion.div>

      {/* ── KPI Grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4" style={{ gap: '20px' }}>
        <Stat
          icon={Terminal}
          label="Active sessions"
          value={String(activeSessions)}
          accent="var(--green)"
          sub={`${sessions.length} total`}
        />
        <Stat
          icon={Activity}
          label="Tokens today"
          value={stats.totalTokensToday.toLocaleString()}
          accent="var(--cyan)"
        />
        <Stat
          icon={Coins}
          label="Cost today"
          value={`$${(stats.totalCostToday / 100).toFixed(2)}`}
          accent="var(--amber)"
        />
        <Stat
          icon={Zap}
          label="Avg latency"
          value={`${stats.avgLatency}ms`}
          accent="var(--violet)"
        />
      </div>

      {/* ── Welcome Hero ── */}
      {sessions.length === 0 && (
        <motion.div
          variants={fadeUp}
          className="card"
          style={{ border: '1px solid var(--border-1)', overflow: 'hidden' }}
        >
          <div
            className="relative"
            style={{
              padding: '80px 48px',
              background: `
                radial-gradient(ellipse at 20% 50%, rgba(0, 212, 255, 0.06) 0%, transparent 60%),
                radial-gradient(ellipse at 80% 50%, rgba(139, 92, 246, 0.05) 0%, transparent 60%),
                var(--bg-2)
              `,
            }}
          >
            <div className="relative z-10 text-center max-w-md mx-auto">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto"
                style={{
                  background: 'var(--gradient-primary)',
                  boxShadow: '0 0 48px rgba(0, 212, 255, 0.15)',
                }}
              >
                <Sparkles size={26} color="#000" strokeWidth={2} />
              </div>

              <h2
                className="font-display font-bold tracking-tight"
                style={{ color: 'var(--text-0)', fontSize: '1.5rem', marginTop: '32px' }}
              >
                Welcome to Orchestra
              </h2>

              <p
                className="leading-relaxed mx-auto"
                style={{
                  color: 'var(--text-3)',
                  fontSize: '14px',
                  marginTop: '16px',
                  maxWidth: '360px',
                }}
              >
                Manage multiple Claude Code instances, agents, skills, and configuration from one dashboard.
              </p>

              <div
                className="flex gap-4 justify-center"
                style={{ marginTop: '36px' }}
              >
                <button
                  onClick={() => setPage('sessions')}
                  className="btn-primary rounded-xl text-sm flex items-center gap-2.5"
                  style={{ padding: '12px 24px' }}
                >
                  <Terminal size={15} />
                  New Session
                </button>
                <button
                  onClick={() => setPage('agents')}
                  className="btn-ghost rounded-xl text-sm flex items-center gap-2.5"
                  style={{ padding: '12px 24px' }}
                >
                  <TrendingUp size={15} />
                  Browse Agents
                </button>
              </div>

              <div
                className="flex justify-center font-mono"
                style={{
                  gap: '32px',
                  marginTop: '48px',
                  fontSize: '11px',
                  color: 'var(--text-4)',
                }}
              >
                <span>⌘K palette</span>
                <span>⌘N session</span>
                <span>⌘, settings</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── Recent Sessions ── */}
      {sessions.length > 0 && (
        <motion.div variants={fadeUp} className="card" style={{ padding: '28px' }}>
          <div className="relative z-10">
            <h2
              className="font-display text-sm font-semibold"
              style={{ color: 'var(--text-2)', marginBottom: '20px' }}
            >
              Recent Sessions
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {sessions.slice(0, 5).map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between rounded-xl"
                  style={{ padding: '14px 16px', background: 'var(--bg-3)' }}
                >
                  <div className="flex items-center gap-3">
                    <span className={`status-dot ${
                      session.status === 'running' ? 'status-live' :
                      session.status === 'error' ? 'status-error' : 'status-idle'
                    }`} />
                    <span className="text-[13px] font-medium font-mono" style={{ color: 'var(--text-1)' }}>
                      {session.id.slice(0, 8)}
                    </span>
                    <span className="text-[11px]" style={{ color: 'var(--text-4)' }}>
                      {session.model.replace('claude-', '')}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono" style={{ color: 'var(--text-4)' }}>
                    {session.totalTokensUsed.toLocaleString()} tok
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
