import { motion } from 'framer-motion';
import { Plug, Plus } from 'lucide-react';

export function PluginsPage() {
  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h1" style={{ color: 'var(--text-primary)' }}>
            Plugins & MCP Servers
          </h1>
          <p className="text-body mt-1" style={{ color: 'var(--text-secondary)' }}>
            Gérez vos connexions aux serveurs MCP et extensions
          </p>
        </div>
        <button
          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium"
          style={{ background: 'var(--accent-primary)', color: 'white' }}
        >
          <Plus size={16} />
          Ajouter un plugin
        </button>
      </div>

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
          <Plug size={28} />
        </div>
        <h3 className="text-h3 mb-2" style={{ color: 'var(--text-primary)' }}>
          Marketplace de plugins
        </h3>
        <p className="text-body" style={{ color: 'var(--text-secondary)' }}>
          Connectez des serveurs MCP pour étendre les capacités de Claude Code.
        </p>
      </motion.div>
    </div>
  );
}
