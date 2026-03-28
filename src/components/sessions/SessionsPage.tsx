import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Terminal, LayoutGrid, Rows3, Columns3, Grid2x2 } from 'lucide-react';
import { useSessionStore } from '@/stores/sessionStore';
import { useUIStore } from '@/stores/uiStore';
import { SessionCard } from './SessionCard';
import { SessionTerminal } from './SessionTerminal';
import { NewSessionModal } from './NewSessionModal';

export function SessionsPage() {
  const sessions = useSessionStore((s) => s.sessions);
  const selectedSessionId = useSessionStore((s) => s.selectedSessionId);
  const setSelectedSession = useSessionStore((s) => s.setSelectedSession);
  const { splitLayout, setSplitLayout } = useUIStore();
  const [showNewModal, setShowNewModal] = useState(false);
  const [terminalSessionId, setTerminalSessionId] = useState<string | null>(null);

  const terminalSession = sessions.find((s) => s.id === terminalSessionId);

  return (
    <div className="flex flex-col h-full gap-5">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-h1" style={{ color: 'var(--text-primary)' }}>
            Sessions
          </h1>
          <p className="text-body mt-1" style={{ color: 'var(--text-secondary)' }}>
            Gérez vos instances Claude Code
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Split layout toggles */}
          <div
            className="flex rounded-lg border overflow-hidden"
            style={{ borderColor: 'var(--border-default)' }}
          >
            {[
              { layout: 'single' as const, icon: LayoutGrid, label: 'Single' },
              { layout: 'horizontal' as const, icon: Rows3, label: 'Horizontal' },
              { layout: 'vertical' as const, icon: Columns3, label: 'Vertical' },
              { layout: 'quad' as const, icon: Grid2x2, label: 'Quad' },
            ].map(({ layout, icon: Icon, label }) => (
              <button
                key={layout}
                onClick={() => setSplitLayout(layout)}
                className="p-1.5 transition-colors"
                style={{
                  background: splitLayout === layout ? 'var(--accent-primary-glow)' : 'transparent',
                  color: splitLayout === layout ? 'var(--accent-primary)' : 'var(--text-ghost)',
                }}
                title={label}
              >
                <Icon size={14} />
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowNewModal(true)}
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
            style={{ background: 'var(--accent-primary)', color: 'white' }}
          >
            <Plus size={16} />
            Nouvelle session
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 flex gap-5">
        {/* Session grid */}
        <div className={`${terminalSession ? 'w-80 shrink-0' : 'flex-1'} overflow-y-auto`}>
          {sessions.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border p-12 text-center"
              style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: 'var(--accent-primary-glow)', color: 'var(--accent-primary)' }}
              >
                <Terminal size={28} />
              </div>
              <h3 className="text-h3 mb-2" style={{ color: 'var(--text-primary)' }}>
                Aucune session active
              </h3>
              <p className="text-body mb-4" style={{ color: 'var(--text-secondary)' }}>
                Créez une session pour lancer Claude Code sur un projet.
              </p>
              <button
                onClick={() => setShowNewModal(true)}
                className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium"
                style={{ background: 'var(--accent-primary)', color: 'white' }}
              >
                <Plus size={16} />
                Créer une session
              </button>
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
                  onStop={async () => {
                    try {
                      const { invoke } = await import('@tauri-apps/api/core');
                      await invoke('kill_process', { sessionId: session.id });
                    } catch { /* browser mode */ }
                  }}
                  onRestart={async () => {
                    try {
                      const { invoke } = await import('@tauri-apps/api/core');
                      await invoke('spawn_process', {
                        sessionId: session.id,
                        projectPath: '',
                        model: session.model,
                        extraArgs: [],
                      });
                    } catch { /* browser mode */ }
                  }}
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
              transition={{ duration: 0.2 }}
            >
              <SessionTerminal
                session={terminalSession}
                onClose={() => setTerminalSessionId(null)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* New session modal */}
      <NewSessionModal open={showNewModal} onClose={() => setShowNewModal(false)} />
    </div>
  );
}
