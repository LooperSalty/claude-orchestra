import { motion } from 'framer-motion';
import { Activity, Terminal, Coins, Zap, TrendingUp, ArrowUpRight, Sparkles } from 'lucide-react';
import { useSessionStore } from '@/stores/sessionStore';
import { useMetricsStore } from '@/stores/metricsStore';
import { useUIStore } from '@/stores/uiStore';

const stagger = {
  animate: { transition: { staggerChildren: 0.05 } },
};

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const } },
};

interface StatProps {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  accent: string;
  glowClass?: string;
}

function Stat({ icon: Icon, label, value, sub, accent, glowClass }: StatProps) {
  return (
    <motion.div variants={fadeUp} className={`card card-glow-cyan p-6 ${glowClass ?? ''}`}>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: `${accent}12`, color: accent }}
          >
            <Icon size={17} strokeWidth={2} />
          </div>
          <ArrowUpRight size={14} style={{ color: 'var(--text-4)' }} />
        </div>
        <div className="font-display text-3xl font-bold tracking-tight" style={{ color: 'var(--text-0)' }}>
          {value}
        </div>
        <div className="text-[11px] mt-1 font-medium" style={{ color: 'var(--text-3)' }}>
          {label}
        </div>
        {sub && (
          <div className="text-[10px] mt-1.5 font-mono" style={{ color: 'var(--text-4)' }}>
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
      className="space-y-8 max-w-[1100px]"
    >
      {/* ── Header ── */}
      <motion.div variants={fadeUp}>
        <h1 className="font-display text-3xl font-bold tracking-tight" style={{ color: 'var(--text-0)' }}>
          Dashboard
        </h1>
        <p className="text-[13px] mt-1" style={{ color: 'var(--text-3)' }}>
          Claude Orchestra — control center
        </p>
      </motion.div>

      {/* ── KPI Grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <Stat
          icon={Terminal}
          label="Active sessions"
          value={String(activeSessions)}
          accent="var(--green)"
          sub={`${sessions.length} total`}
          glowClass="card-glow-green"
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
          glowClass="card-glow-violet"
        />
        <Stat
          icon={Zap}
          label="Avg latency"
          value={`${stats.avgLatency}ms`}
          accent="var(--violet)"
          glowClass="card-glow-violet"
        />
      </div>

      {/* ── Empty State / Hero ── */}
      {sessions.length === 0 && (
        <motion.div
          variants={fadeUp}
          className="card p-0 overflow-hidden"
          style={{ border: '1px solid var(--border-1)' }}
        >
          {/* Gradient mesh background */}
          <div
            className="relative px-12 py-20"
            style={{
              background: `
                radial-gradient(ellipse at 20% 50%, rgba(0, 212, 255, 0.06) 0%, transparent 60%),
                radial-gradient(ellipse at 80% 50%, rgba(139, 92, 246, 0.06) 0%, transparent 60%),
                var(--bg-2)
              `,
            }}
          >
            <div className="relative z-10 text-center max-w-md mx-auto">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
                style={{
                  background: 'var(--gradient-primary)',
                  boxShadow: '0 0 40px rgba(0, 212, 255, 0.15)',
                }}
              >
                <Sparkles size={24} color="#000" strokeWidth={2} />
              </div>

              <h2 className="font-display text-xl font-bold tracking-tight mb-2" style={{ color: 'var(--text-0)' }}>
                Welcome to Orchestra
              </h2>
              <p className="text-[14px] leading-relaxed mb-8" style={{ color: 'var(--text-3)' }}>
                Manage multiple Claude Code instances, agents, skills, and configuration from one dashboard.
              </p>

              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setPage('sessions')}
                  className="btn-primary rounded-xl px-5 py-2.5 text-sm flex items-center gap-2"
                >
                  <Terminal size={15} />
                  New Session
                </button>
                <button
                  onClick={() => setPage('agents')}
                  className="btn-ghost rounded-xl px-5 py-2.5 text-sm flex items-center gap-2"
                >
                  <TrendingUp size={15} />
                  Browse Agents
                </button>
              </div>

              <div className="flex justify-center gap-8 mt-10 text-[11px] font-mono" style={{ color: 'var(--text-4)' }}>
                <span>⌘K command palette</span>
                <span>⌘N new session</span>
                <span>⌘, settings</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── Recent Sessions ── */}
      {sessions.length > 0 && (
        <motion.div variants={fadeUp} className="card p-5">
          <div className="relative z-10">
            <h2 className="font-display text-sm font-semibold mb-4" style={{ color: 'var(--text-2)' }}>
              Recent Sessions
            </h2>
            <div className="space-y-1.5">
              {sessions.slice(0, 5).map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between py-2.5 px-3.5 rounded-xl transition-colors"
                  style={{ background: 'var(--bg-3)' }}
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
