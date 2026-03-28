import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, LayoutGrid, Globe } from 'lucide-react';
import { useAgentStore } from '@/stores/agentStore';
import { AgentEditor } from './AgentEditor';
import { AgentWorld } from './AgentWorld';
import { DEFAULT_AGENTS } from '@/types/agent';
import type { AgentConfig } from '@/types/agent';

type ViewMode = 'grid' | 'world';

const cardVariants = {
  initial: { opacity: 0, scale: 0.95, y: 15 },
  animate: (i: number) => ({
    opacity: 1, scale: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as const },
  }),
};

const AGENT_COLORS = [
  'var(--accent-primary)', 'var(--accent-success)', 'var(--accent-warning)',
  'var(--accent-error)', 'var(--accent-purple)', 'var(--accent-cyan)', 'var(--accent-orange)',
];

const AGENT_ICONS = ['🏗️', '⚡', '🔍', '🐛', '🧪', '🎨', '📝', '🔧'];

function ViewToggle({ mode, onChange }: { mode: ViewMode; onChange: (m: ViewMode) => void }) {
  return (
    <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
      <button
        onClick={() => onChange('grid')}
        className="flex items-center gap-1.5 px-3 py-1.5 text-small font-medium transition-colors"
        style={{
          background: mode === 'grid' ? 'rgba(0, 212, 255, 0.1)' : 'transparent',
          color: mode === 'grid' ? 'var(--cyan)' : 'var(--text-3)',
          borderRight: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        <LayoutGrid size={13} />
        Grille
      </button>
      <button
        onClick={() => onChange('world')}
        className="flex items-center gap-1.5 px-3 py-1.5 text-small font-medium transition-colors"
        style={{
          background: mode === 'world' ? 'rgba(0, 212, 255, 0.1)' : 'transparent',
          color: mode === 'world' ? 'var(--cyan)' : 'var(--text-3)',
        }}
      >
        <Globe size={13} />
        Monde
      </button>
    </div>
  );
}

export function AgentsPage() {
  const { agents, setAgents } = useAgentStore();
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<AgentConfig | undefined>();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Load default agents on first visit
  useEffect(() => {
    if (agents.length === 0) {
      const now = new Date().toISOString();
      const defaults = DEFAULT_AGENTS.map((a) => ({
        ...a,
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
      }));
      setAgents(defaults);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handleEdit(agent: AgentConfig) {
    setEditingAgent(agent);
    setEditorOpen(true);
  }

  function handleNew() {
    setEditingAgent(undefined);
    setEditorOpen(true);
  }

  return (
    <div className={viewMode === 'world' ? 'flex flex-col h-full' : 'space-y-8 max-w-6xl'}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-h1" style={{ color: 'var(--text-primary)' }}>Agents</h1>
          <p className="text-body mt-1" style={{ color: 'var(--text-secondary)' }}>
            Profils de configuration réutilisables pour Claude Code
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ViewToggle mode={viewMode} onChange={setViewMode} />
          <button onClick={handleNew}
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium"
            style={{ background: 'var(--accent-primary)', color: 'white' }}>
            <Plus size={16} /> Nouvel agent
          </button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {agents.map((agent, i) => (
            <motion.div key={agent.id} custom={i} variants={cardVariants}
              initial="initial" animate="animate"
              onClick={() => handleEdit(agent)}
              className="rounded-xl border p-5 cursor-pointer transition-all duration-200 group"
              style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-lg"
                  style={{
                    background: `${AGENT_COLORS[i % AGENT_COLORS.length]}15`,
                    color: AGENT_COLORS[i % AGENT_COLORS.length],
                  }}>
                  {AGENT_ICONS[i % AGENT_ICONS.length]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                    {agent.name}
                  </div>
                  <div className="text-small mono" style={{ color: 'var(--text-ghost)' }}>
                    {agent.model.replace('claude-', '')}
                  </div>
                </div>
                <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg"
                  style={{ color: 'var(--text-tertiary)' }} onClick={(e) => { e.stopPropagation(); handleEdit(agent); }}>
                  <Edit2 size={14} />
                </button>
              </div>

              {agent.description && (
                <p className="text-small line-clamp-2 mb-3" style={{ color: 'var(--text-secondary)' }}>
                  {agent.description}
                </p>
              )}

              <div className="flex gap-3 text-small" style={{ color: 'var(--text-ghost)' }}>
                <span>Tokens: <span className="mono">{agent.maxTokens.toLocaleString()}</span></span>
                <span>Temp: <span className="mono">{agent.temperature.toFixed(1)}</span></span>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="flex-1 min-h-0">
          <AgentWorld />
        </div>
      )}

      <AgentEditor agent={editingAgent} open={editorOpen} onClose={() => setEditorOpen(false)} />
    </div>
  );
}
