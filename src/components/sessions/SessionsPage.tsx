import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Terminal, LayoutGrid, Rows3, Columns3, Grid2x2, Square } from 'lucide-react';
import { useSessionStore } from '@/stores/sessionStore';
import { useUIStore } from '@/stores/uiStore';
import { useSession } from '@/hooks/useSession';
import { SessionCard } from './SessionCard';
import { SessionTerminal } from './SessionTerminal';
import { NewSessionModal } from './NewSessionModal';

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } },
};

export function SessionsPage() {
  const sessions = useSessionStore((s) => s.sessions);
  const selectedSessionId = useSessionStore((s) => s.selectedSessionId);
  const setSelectedSession = useSessionStore((s) => s.setSelectedSession);
  const { splitLayout, setSplitLayout } = useUIStore();
  const { stopSession } = useSession();
  const [showNewModal, setShowNewModal] = useState(false);
  const [terminalSessionId, setTerminalSessionId] = useState<string | null>(null);

  const terminalSession = sessions.find((s) => s.id === terminalSessionId);
  const runningSessions = sessions.filter((s) => s.status === 'running');

  return (
    <div className="flex flex-col h-full" style={{ gap: '32px' }}>
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1
            className="font-display font-bold tracking-tight"
            style={{ color: 'var(--text-0)', fontSize: '2rem', lineHeight: 1.1 }}
          >
            Sessions
          </h1>
          <p className="text-[13px]" style={{ color: 'var(--text-3)', marginTop: '8px' }}>
            {runningSessions.length} active · {sessions.length} total
          </p>
        </div>
        <div className="flex items-center" style={{ gap: '12px' }}>
          {/* Layout toggles */}
          <div
            className="flex rounded-xl border overflow-hidden"
            style={{ borderColor: 'var(--border-1)' }}
          >
            {[
              { layout: 'single' as const, icon: LayoutGrid },
              { layout: 'horizontal' as const, icon: Rows3 },
              { layout: 'vertical' as const, icon: Columns3 },
              { layout: 'quad' as const, icon: Grid2x2 },
            ].map(({ layout, icon: Icon }) => (
              <button
                key={layout}
                onClick={() => setSplitLayout(layout)}
                className="transition-all"
                style={{
                  padding: '8px 10px',
                  background: splitLayout === layout ? 'var(--cyan-glow)' : 'transparent',
                  color: splitLayout === layout ? 'var(--cyan)' : 'var(--text-4)',
                }}
              >
                <Icon size={14} />
              </button>
            ))}
          </div>

          {runningSessions.length > 0 && (
            <button
              onClick={() => runningSessions.forEach((s) => stopSession(s.id))}
              className="flex items-center rounded-xl text-sm btn-ghost"
              style={{ gap: '8px', padding: '10px 16px', color: 'var(--red)' }}
            >
              <Square size={14} />
              Stop All
            </button>
          )}

          <button
            onClick={() => setShowNewModal(true)}
            className="flex items-center rounded-xl text-sm font-semibold btn-primary"
            style={{ gap: '8px', padding: '10px 20px' }}
          >
            <Plus size={15} />
            New Session
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 flex" style={{ gap: '24px' }}>
        {/* Session list */}
        <div className={`${terminalSession ? 'w-[360px] shrink-0' : 'flex-1'} overflow-y-auto`}>
          {sessions.length === 0 ? (
            <motion.div
              variants={fadeUp}
              initial="initial"
              animate="animate"
              className="card"
              style={{ overflow: 'hidden' }}
            >
              <div
                className="relative text-center"
                style={{
                  padding: '80px 48px',
                  background: `
                    radial-gradient(ellipse at 30% 40%, rgba(0, 212, 255, 0.05) 0%, transparent 60%),
                    radial-gradient(ellipse at 70% 60%, rgba(0, 255, 136, 0.04) 0%, transparent 60%),
                    var(--bg-2)
                  `,
                }}
              >
                <div className="relative z-10 max-w-sm mx-auto">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto"
                    style={{
                      background: 'var(--gradient-success)',
                      boxShadow: '0 0 48px rgba(0, 255, 136, 0.12)',
                    }}
                  >
                    <Terminal size={26} color="#000" strokeWidth={2} />
                  </div>

                  <h3
                    className="font-display font-bold tracking-tight"
                    style={{ color: 'var(--text-0)', fontSize: '1.35rem', marginTop: '28px' }}
                  >
                    No active sessions
                  </h3>

                  <p
                    className="leading-relaxed"
                    style={{
                      color: 'var(--text-3)',
                      fontSize: '13px',
                      marginTop: '12px',
                    }}
                  >
                    Launch Claude Code on a project directory to start managing your instances.
                  </p>

                  <button
                    onClick={() => setShowNewModal(true)}
                    className="btn-primary rounded-xl text-sm inline-flex items-center font-semibold"
                    style={{ gap: '8px', padding: '12px 24px', marginTop: '32px' }}
                  >
                    <Plus size={15} />
                    Create Session
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <div
              className={`grid ${terminalSession ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'}`}
              style={{ gap: '16px' }}
            >
              {sessions.map((session, i) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  index={i}
                  isSelected={selectedSessionId === session.id}
                  onSelect={() => setSelectedSession(session.id)}
                  onOpenTerminal={() => setTerminalSessionId(session.id)}
                  onStop={() => stopSession(session.id)}
                  onRestart={() => {/* TODO */}}
                />
              ))}
            </div>
          )}
        </div>

        {/* Terminal panel */}
        <AnimatePresence>
          {terminalSession && (
            <motion.div
              className="flex-1 min-w-0"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] as const }}
            >
              <SessionTerminal
                session={terminalSession}
                onClose={() => setTerminalSessionId(null)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <NewSessionModal open={showNewModal} onClose={() => setShowNewModal(false)} />
    </div>
  );
}
