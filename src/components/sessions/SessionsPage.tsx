import { motion } from 'framer-motion';
import { Plus, Terminal, Play, Square, RotateCcw } from 'lucide-react';
import { useSessionStore } from '@/stores/sessionStore';

const cardVariants = {
  initial: { opacity: 0, scale: 0.95, y: 15 },
  animate: (i: number) => ({
    opacity: 1, scale: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as const },
  }),
};

export function SessionsPage() {
  const sessions = useSessionStore((s) => s.sessions);

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h1" style={{ color: 'var(--text-primary)' }}>
            Sessions
          </h1>
          <p className="text-body mt-1" style={{ color: 'var(--text-secondary)' }}>
            Gérez vos instances Claude Code
          </p>
        </div>
        <button
          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
          style={{
            background: 'var(--accent-primary)',
            color: 'white',
          }}
        >
          <Plus size={16} />
          Nouvelle session
        </button>
      </div>

      {sessions.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
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
            <Terminal size={28} />
          </div>
          <h3 className="text-h3 mb-2" style={{ color: 'var(--text-primary)' }}>
            Aucune session active
          </h3>
          <p className="text-body" style={{ color: 'var(--text-secondary)' }}>
            Créez une session pour lancer Claude Code sur un projet.
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {sessions.map((session, i) => (
            <motion.div
              key={session.id}
              custom={i}
              variants={cardVariants}
              initial="initial"
              animate="animate"
              className="rounded-xl border p-4 space-y-3"
              style={{
                background: 'var(--bg-surface)',
                borderColor: session.status === 'running'
                  ? 'var(--accent-success)'
                  : 'var(--border-subtle)',
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      session.status === 'running' ? 'pulse-running' : ''
                    }`}
                    style={{
                      background:
                        session.status === 'running'
                          ? 'var(--accent-success)'
                          : session.status === 'error'
                          ? 'var(--accent-error)'
                          : 'var(--text-ghost)',
                    }}
                  />
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    Session {session.id.slice(0, 8)}
                  </span>
                </div>
                <span
                  className="text-caption px-2 py-0.5 rounded-full"
                  style={{
                    background:
                      session.status === 'running'
                        ? 'var(--accent-success-glow)'
                        : 'var(--bg-hover)',
                    color:
                      session.status === 'running'
                        ? 'var(--accent-success)'
                        : 'var(--text-tertiary)',
                  }}
                >
                  {session.status}
                </span>
              </div>

              <div className="space-y-1 text-small" style={{ color: 'var(--text-secondary)' }}>
                <div>Model: {session.model}</div>
                <div>Tokens: {session.totalTokensUsed.toLocaleString()}</div>
              </div>

              <div className="flex gap-2">
                <button
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs transition-colors"
                  style={{
                    background: 'var(--bg-elevated)',
                    color: 'var(--accent-success)',
                  }}
                >
                  <Play size={12} /> Start
                </button>
                <button
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs transition-colors"
                  style={{
                    background: 'var(--bg-elevated)',
                    color: 'var(--accent-error)',
                  }}
                >
                  <Square size={12} /> Stop
                </button>
                <button
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs transition-colors"
                  style={{
                    background: 'var(--bg-elevated)',
                    color: 'var(--text-tertiary)',
                  }}
                >
                  <RotateCcw size={12} /> Restart
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
