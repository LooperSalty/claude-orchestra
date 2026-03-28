import { motion } from 'framer-motion';
import { Plus, Bot } from 'lucide-react';
import { useAgentStore } from '@/stores/agentStore';

const cardVariants = {
  initial: { opacity: 0, scale: 0.95, y: 15 },
  animate: (i: number) => ({
    opacity: 1, scale: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as const },
  }),
};

const AGENT_COLORS = [
  'var(--accent-primary)',
  'var(--accent-success)',
  'var(--accent-warning)',
  'var(--accent-error)',
  'var(--accent-purple)',
  'var(--accent-cyan)',
  'var(--accent-orange)',
];

export function AgentsPage() {
  const agents = useAgentStore((s) => s.agents);

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h1" style={{ color: 'var(--text-primary)' }}>
            Agents
          </h1>
          <p className="text-body mt-1" style={{ color: 'var(--text-secondary)' }}>
            Profils de configuration réutilisables pour Claude Code
          </p>
        </div>
        <button
          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium"
          style={{ background: 'var(--accent-primary)', color: 'white' }}
        >
          <Plus size={16} />
          Nouvel agent
        </button>
      </div>

      {agents.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border p-12 text-center"
          style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(251, 146, 60, 0.15)', color: 'var(--accent-orange)' }}
          >
            <Bot size={28} />
          </div>
          <h3 className="text-h3 mb-2" style={{ color: 'var(--text-primary)' }}>
            Aucun agent configuré
          </h3>
          <p className="text-body" style={{ color: 'var(--text-secondary)' }}>
            Créez des profils d'agents avec des configurations prédéfinies.
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {agents.map((agent, i) => (
            <motion.div
              key={agent.id}
              custom={i}
              variants={cardVariants}
              initial="initial"
              animate="animate"
              className="rounded-xl border p-4 cursor-pointer transition-colors hover:border-opacity-60"
              style={{
                background: 'var(--bg-surface)',
                borderColor: 'var(--border-subtle)',
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{
                    background: `${AGENT_COLORS[i % AGENT_COLORS.length]}20`,
                    color: AGENT_COLORS[i % AGENT_COLORS.length],
                  }}
                >
                  <Bot size={20} />
                </div>
                <div>
                  <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {agent.name}
                  </div>
                  <div className="text-small" style={{ color: 'var(--text-tertiary)' }}>
                    {agent.model}
                  </div>
                </div>
              </div>
              {agent.description && (
                <p className="text-small line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                  {agent.description}
                </p>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
