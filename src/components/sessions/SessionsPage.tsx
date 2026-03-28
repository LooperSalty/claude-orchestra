import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Terminal as TermIcon, LayoutGrid, Rows3, Columns3, Grid2x2, Square } from 'lucide-react';
import { useSessionStore } from '@/stores/sessionStore';
import { useUIStore } from '@/stores/uiStore';
import { useSession } from '@/hooks/useSession';
import { SessionCard } from './SessionCard';
import { SessionTerminal } from './SessionTerminal';
import { NewSessionModal } from './NewSessionModal';

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
    <div className="flex flex-col h-full gap-6">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight" style={{ color: 'var(--text-0)' }}>
            Sessions
          </h1>
          <p className="text-[13px] mt-1.5" style={{ color: 'var(--text-3)' }}>
            {runningSessions.length} active · {sessions.length} total
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Layout toggles */}
          <div className="flex rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border-1)' }}>
            {[
              { layout: 'single' as const, icon: LayoutGrid },
              { layout: 'horizontal' as const, icon: Rows3 },
              { layout: 'vertical' as const, icon: Columns3 },
              { layout: 'quad' as const, icon: Grid2x2 },
            ].map(({ layout, icon: Icon }) => (
              <button
                key={layout}
                onClick={() => setSplitLayout(layout)}
                className="p-2 transition-all"
                style={{
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
              className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm btn-ghost"
              style={{ color: 'var(--red)' }}
            >
              <Square size={14} />
              Stop All
            </button>
          )}

          <button
            onClick={() => setShowNewModal(true)}
            className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold btn-primary"
          >
            <Plus size={15} />
            New Session
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 flex gap-6">
        {/* Session list */}
        <div className={`${terminalSession ? 'w-[340px] shrink-0' : 'flex-1'} overflow-y-auto`}>
          {sessions.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="card p-0 overflow-hidden"
            >
              <div
                className="relative px-12 py-20 text-center"
                style={{
                  background: `
                    radial-gradient(ellipse at 30% 50%, rgba(0, 212, 255, 0.05) 0%, transparent 60%),
                    radial-gradient(ellipse at 70% 50%, rgba(0, 255, 136, 0.04) 0%, transparent 60%),
                    var(--bg-2)
                  `,
                }}
              >
                <div className="relative z-10">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6"
                    style={{
                      background: 'var(--gradient-success)',
                      boxShadow: '0 0 40px rgba(0, 255, 136, 0.12)',
                    }}
                  >
                    <TermIcon size={24} color="#000" />
                  </div>
                  <h3 className="font-display text-lg font-bold mb-2" style={{ color: 'var(--text-0)' }}>
                    No active sessions
                  </h3>
                  <p className="text-[13px] mb-8" style={{ color: 'var(--text-3)' }}>
                    Launch Claude Code on a project directory to start.
                  </p>
                  <button
                    onClick={() => setShowNewModal(true)}
                    className="btn-primary rounded-xl px-6 py-3 text-sm inline-flex items-center gap-2"
                  >
                    <Plus size={15} />
                    Create Session
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className={`grid gap-5 ${terminalSession ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'}`}>
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
