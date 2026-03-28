import { motion } from 'framer-motion';
import {
  Activity, Terminal, Coins, Zap, ArrowUpRight, Sparkles,
  TrendingUp, Users, BookOpen, Settings2,
} from 'lucide-react';
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
  trend?: string;
}

function Stat({ icon: Icon, label, value, sub, accent, trend }: StatProps) {
  return (
    <motion.div
      variants={fadeUp}
      className="card"
      style={{
        padding: '24px 20px',
        background: `linear-gradient(135deg, var(--bg-2) 0%, var(--bg-3) 100%)`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute', top: -20, right: -20,
          width: 80, height: 80, borderRadius: '50%',
          background: `${accent}08`, filter: 'blur(20px)',
        }}
      />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div className="flex items-center justify-between" style={{ marginBottom: '20px' }}>
          <div
            className="flex items-center justify-center"
            style={{
              width: 40, height: 40, borderRadius: 12,
              background: `${accent}12`,
              boxShadow: `0 0 20px ${accent}15, inset 0 0 12px ${accent}08`,
            }}
          >
            <Icon size={17} strokeWidth={2} style={{ color: accent }} />
          </div>
          {trend && (
            <div
              className="flex items-center gap-1 font-mono"
              style={{
                fontSize: 10, padding: '3px 8px', borderRadius: 6,
                background: 'var(--green)10', color: 'var(--green)',
              }}
            >
              <TrendingUp size={10} /> {trend}
            </div>
          )}
          {!trend && <ArrowUpRight size={13} style={{ color: 'var(--text-4)' }} />}
        </div>
        <div
          className="font-display font-extrabold tracking-tight"
          style={{ color: 'var(--text-0)', fontSize: '2rem', lineHeight: 1 }}
        >
          {value}
        </div>
        <div
          className="font-medium"
          style={{ color: 'var(--text-3)', fontSize: 12, marginTop: 10 }}
        >
          {label}
        </div>
        {sub && (
          <div className="font-mono" style={{ color: 'var(--text-4)', fontSize: 10, marginTop: 6 }}>
            {sub}
          </div>
        )}
      </div>
    </motion.div>
  );
}

const QUICK_ACTIONS = [
  { icon: Terminal, label: 'New Session', desc: 'Launch Claude instance', page: 'sessions' as const, accent: 'var(--cyan)', glow: 'card-glow-cyan' },
  { icon: Users, label: 'Browse Agents', desc: 'Manage agent pool', page: 'agents' as const, accent: 'var(--violet)', glow: 'card-glow-violet' },
  { icon: BookOpen, label: 'View Skills', desc: 'Skill library', page: 'skills' as const, accent: 'var(--green)', glow: 'card-glow-green' },
  { icon: Settings2, label: 'Open Config', desc: 'App settings', page: 'config' as const, accent: 'var(--amber)', glow: '' },
] as const;

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
      style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}
    >
      {/* ── Header with ambient glow ── */}
      <motion.div variants={fadeUp} style={{ paddingTop: '12px', position: 'relative' }}>
        <div style={{
          position: 'absolute', top: -60, left: '20%', width: 400, height: 200,
          background: 'radial-gradient(ellipse, rgba(0,212,255,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', top: -40, right: '15%', width: 300, height: 180,
          background: 'radial-gradient(ellipse, rgba(139,92,246,0.05) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <h1
          className="font-display font-bold tracking-tight"
          style={{ color: 'var(--text-0)', fontSize: '2rem', lineHeight: 1.1, position: 'relative' }}
        >
          Dashboard
        </h1>
        <p style={{ color: 'var(--text-3)', fontSize: 13, marginTop: 10, position: 'relative' }}>
          Claude Orchestra — control center
        </p>
      </motion.div>

      {/* ── KPI Grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4" style={{ gap: '16px' }}>
        <Stat icon={Terminal} label="Active sessions" value={String(activeSessions)} accent="var(--green)" sub={`${sessions.length} total`} trend="+2" />
        <Stat icon={Activity} label="Tokens today" value={stats.totalTokensToday.toLocaleString()} accent="var(--cyan)" />
        <Stat icon={Coins} label="Cost today" value={`$${(stats.totalCostToday / 100).toFixed(2)}`} accent="var(--amber)" />
        <Stat icon={Zap} label="Avg latency" value={`${stats.avgLatency}ms`} accent="var(--violet)" />
      </div>

      {/* ── Welcome Hero ── */}
      {sessions.length === 0 && (
        <motion.div
          variants={fadeUp}
          className="card"
          style={{ border: '1px solid var(--border-1)', overflow: 'hidden' }}
        >
          <div
            style={{
              position: 'relative', padding: '80px 48px',
              background: `
                radial-gradient(ellipse at 30% 40%, rgba(0,212,255,0.08) 0%, transparent 55%),
                radial-gradient(ellipse at 70% 60%, rgba(139,92,246,0.07) 0%, transparent 55%),
                radial-gradient(ellipse at 50% 90%, rgba(0,255,136,0.03) 0%, transparent 50%),
                var(--bg-2)
              `,
            }}
          >
            {/* Floating dots */}
            {[
              { top: '15%', left: '10%', size: 3, opacity: 0.3 },
              { top: '25%', right: '15%', size: 2, opacity: 0.2 },
              { top: '70%', left: '20%', size: 2, opacity: 0.15 },
              { top: '60%', right: '25%', size: 3, opacity: 0.25 },
              { top: '40%', left: '75%', size: 2, opacity: 0.2 },
            ].map((dot, i) => (
              <motion.div
                key={i}
                animate={{ y: [0, -8, 0], opacity: [dot.opacity, dot.opacity + 0.1, dot.opacity] }}
                transition={{ duration: 3 + i, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                  position: 'absolute', top: dot.top, left: dot.left, right: dot.right,
                  width: dot.size, height: dot.size, borderRadius: '50%',
                  background: 'var(--cyan)',
                }}
              />
            ))}
            <div className="text-center max-w-md mx-auto" style={{ position: 'relative', zIndex: 1 }}>
              <div
                className="flex items-center justify-center mx-auto"
                style={{
                  width: 64, height: 64, borderRadius: 18,
                  background: 'var(--gradient-primary)',
                  boxShadow: '0 0 60px rgba(0,212,255,0.2), 0 0 20px rgba(139,92,246,0.15)',
                }}
              >
                <Sparkles size={26} color="#000" strokeWidth={2} />
              </div>
              <h2
                className="font-display font-bold tracking-tight"
                style={{ color: 'var(--text-0)', fontSize: '1.5rem', marginTop: 32 }}
              >
                Welcome to Orchestra
              </h2>
              <p style={{ color: 'var(--text-3)', fontSize: 14, marginTop: 16, maxWidth: 360, marginInline: 'auto', lineHeight: 1.6 }}>
                Manage multiple Claude Code instances, agents, skills, and configuration from one dashboard.
              </p>
              <div className="flex gap-4 justify-center" style={{ marginTop: 36 }}>
                <button onClick={() => setPage('sessions')} className="btn-primary rounded-xl text-sm flex items-center gap-2.5" style={{ padding: '12px 24px' }}>
                  <Terminal size={15} /> New Session
                </button>
                <button onClick={() => setPage('agents')} className="btn-ghost rounded-xl text-sm flex items-center gap-2.5" style={{ padding: '12px 24px' }}>
                  <TrendingUp size={15} /> Browse Agents
                </button>
              </div>
              <div className="flex justify-center font-mono" style={{ gap: 32, marginTop: 48, fontSize: 11, color: 'var(--text-4)' }}>
                <span>Ctrl+K palette</span>
                <span>Ctrl+N session</span>
                <span>Ctrl+, settings</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── Quick Actions ── */}
      <motion.div variants={fadeUp}>
        <h2 className="font-display text-sm font-semibold" style={{ color: 'var(--text-2)', marginBottom: 16 }}>
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4" style={{ gap: 12 }}>
          {QUICK_ACTIONS.map((action) => {
            const AIcon = action.icon;
            return (
              <button
                key={action.label}
                onClick={() => setPage(action.page)}
                className={`card ${action.glow}`}
                style={{
                  padding: '20px 16px', textAlign: 'left', cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  background: 'var(--bg-2)',
                  border: '1px solid var(--border-1)',
                }}
              >
                <div
                  className="flex items-center justify-center"
                  style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: `linear-gradient(135deg, ${action.accent}18, ${action.accent}08)`,
                    marginBottom: 14,
                  }}
                >
                  <AIcon size={16} style={{ color: action.accent }} />
                </div>
                <div className="font-medium" style={{ color: 'var(--text-0)', fontSize: 13 }}>
                  {action.label}
                </div>
                <div style={{ color: 'var(--text-4)', fontSize: 11, marginTop: 4 }}>
                  {action.desc}
                </div>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* ── Recent Sessions ── */}
      {sessions.length > 0 && (
        <motion.div variants={fadeUp} className="card" style={{ padding: '28px' }}>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div className="flex items-center gap-2" style={{ marginBottom: 20 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--cyan)' }} />
              <h2 className="font-display text-sm font-semibold" style={{ color: 'var(--text-2)' }}>
                Recent Sessions
              </h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {sessions.slice(0, 5).map((session) => {
                const isRunning = session.status === 'running';
                const isError = session.status === 'error';
                const accentColor = isRunning ? 'var(--green)' : isError ? 'var(--red)' : 'var(--text-4)';
                return (
                  <div
                    key={session.id}
                    className="flex items-center justify-between"
                    style={{
                      padding: '14px 16px', borderRadius: 12,
                      background: 'var(--bg-3)',
                      borderLeft: `3px solid ${accentColor}`,
                      transition: 'background 0.15s ease',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-4)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg-3)'; }}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={isRunning ? 'status-live' : isError ? 'status-error' : 'status-idle'}
                        style={{
                          width: 8, height: 8, borderRadius: '50%',
                          display: 'inline-block', flexShrink: 0,
                          background: accentColor,
                          boxShadow: isRunning ? `0 0 8px var(--green)` : 'none',
                        }}
                      />
                      <span className="font-mono font-medium" style={{ color: 'var(--text-1)', fontSize: 13 }}>
                        {session.id.slice(0, 8)}
                      </span>
                      <span
                        className="font-mono"
                        style={{
                          fontSize: 10, padding: '2px 8px', borderRadius: 6,
                          background: 'var(--bg-4)', color: 'var(--text-3)',
                        }}
                      >
                        {session.model.replace('claude-', '')}
                      </span>
                    </div>
                    <span className="font-mono" style={{ color: 'var(--text-4)', fontSize: 11 }}>
                      {session.totalTokensUsed.toLocaleString()} tok
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
