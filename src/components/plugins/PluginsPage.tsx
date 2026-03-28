import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plug, Plus, Wifi, WifiOff, AlertCircle, Settings, Trash2 } from 'lucide-react';
import type { Plugin, PluginStatus } from '@/types/plugin';

const cardVariants = {
  initial: { opacity: 0, scale: 0.95, y: 15 },
  animate: (i: number) => ({
    opacity: 1, scale: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as const },
  }),
};

const DEMO_PLUGINS: Plugin[] = [
  { id: '1', name: 'GitHub', type: 'mcp_server', url: 'https://api.github.com', description: 'Issues, PRs, repos, code search', status: 'connected', config: {}, installedAt: new Date().toISOString() },
  { id: '2', name: 'Context7', type: 'mcp_server', url: 'https://context7.com', description: 'Documentation lookup for any library', status: 'connected', config: {}, installedAt: new Date().toISOString() },
  { id: '3', name: 'Slack', type: 'mcp_server', description: 'Send messages, read channels', status: 'disconnected', config: {}, installedAt: new Date().toISOString() },
  { id: '4', name: 'Figma', type: 'mcp_server', url: 'https://api.figma.com', description: 'Read designs, implement from Figma', status: 'disconnected', config: {}, installedAt: new Date().toISOString() },
  { id: '5', name: 'PostgreSQL', type: 'mcp_server', description: 'Query databases, inspect schemas', status: 'error', config: {}, installedAt: new Date().toISOString() },
  { id: '6', name: 'Roblox Studio', type: 'mcp_server', description: 'Create objects, edit scripts, playtest', status: 'connected', config: {}, installedAt: new Date().toISOString() },
];

const STATUS_CONFIG: Record<PluginStatus, { icon: React.ElementType; color: string; label: string }> = {
  connected: { icon: Wifi, color: 'var(--accent-success)', label: 'Connecté' },
  disconnected: { icon: WifiOff, color: 'var(--text-ghost)', label: 'Déconnecté' },
  error: { icon: AlertCircle, color: 'var(--accent-error)', label: 'Erreur' },
};

const PLUGIN_ICONS: Record<string, string> = {
  GitHub: '🐙', Slack: '💬', Figma: '🎨', PostgreSQL: '🗄️', Context7: '📚', 'Roblox Studio': '🎮',
};

export function PluginsPage() {
  const [plugins, setPlugins] = useState<Plugin[]>(DEMO_PLUGINS);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newDesc, setNewDesc] = useState('');

  function handleAdd() {
    if (!newName.trim()) return;
    setPlugins([...plugins, {
      id: crypto.randomUUID(), name: newName, type: 'mcp_server', url: newUrl || undefined,
      description: newDesc || undefined, status: 'disconnected', config: {},
      installedAt: new Date().toISOString(),
    }]);
    setNewName(''); setNewUrl(''); setNewDesc('');
    setShowAddModal(false);
  }

  function handleRemove(id: string) {
    setPlugins(plugins.filter((p) => p.id !== id));
  }

  function handleToggle(id: string) {
    setPlugins(plugins.map((p) =>
      p.id === id ? { ...p, status: p.status === 'connected' ? 'disconnected' : 'connected' } : p
    ));
  }

  const connected = plugins.filter((p) => p.status === 'connected').length;

  return (
    <div className="space-y-8 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h1" style={{ color: 'var(--text-primary)' }}>Plugins & MCP</h1>
          <p className="text-body mt-1" style={{ color: 'var(--text-secondary)' }}>
            {connected} connectés sur {plugins.length} configurés
          </p>
        </div>
        <button onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium"
          style={{ background: 'var(--accent-primary)', color: 'white' }}>
          <Plus size={16} /> Ajouter un plugin
        </button>
      </div>

      {/* Status overview */}
      <div className="flex gap-3">
        {(['connected', 'disconnected', 'error'] as PluginStatus[]).map((status) => {
          const cfg = STATUS_CONFIG[status];
          const count = plugins.filter((p) => p.status === status).length;
          const Icon = cfg.icon;
          return (
            <div key={status} className="flex items-center gap-2 rounded-lg px-3 py-2 border"
              style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-surface)' }}>
              <Icon size={14} style={{ color: cfg.color }} />
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {count} {cfg.label.toLowerCase()}
              </span>
            </div>
          );
        })}
      </div>

      {/* Plugin grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {plugins.map((plugin, i) => {
          const cfg = STATUS_CONFIG[plugin.status];
          const StatusIcon = cfg.icon;
          return (
            <motion.div key={plugin.id} custom={i} variants={cardVariants} initial="initial" animate="animate"
              className={`rounded-xl border p-5 transition-all duration-200 ${
                plugin.status === 'connected' ? 'glow-green' : plugin.status === 'error' ? 'glow-red' : ''
              }`}
              style={{
                background: 'var(--bg-surface)',
                borderColor: plugin.status === 'connected' ? 'rgba(0,229,160,0.3)' :
                  plugin.status === 'error' ? 'rgba(255,77,106,0.3)' : 'var(--border-subtle)',
              }}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{PLUGIN_ICONS[plugin.name] ?? '🔌'}</span>
                  <div>
                    <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{plugin.name}</div>
                    <div className="flex items-center gap-1.5 text-xs mt-0.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        plugin.status === 'connected' ? 'pulse-running' : ''
                      }`} style={{ background: cfg.color }} />
                      <span style={{ color: cfg.color }}>{cfg.label}</span>
                    </div>
                  </div>
                </div>
              </div>

              {plugin.description && (
                <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>{plugin.description}</p>
              )}

              {plugin.url && (
                <div className="text-xs mono mb-3 truncate" style={{ color: 'var(--text-ghost)' }}>{plugin.url}</div>
              )}

              <div className="flex gap-1.5">
                <button onClick={() => handleToggle(plugin.id)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs"
                  style={{
                    background: 'var(--bg-hover)',
                    color: plugin.status === 'connected' ? 'var(--accent-error)' : 'var(--accent-success)',
                  }}>
                  <StatusIcon size={12} /> {plugin.status === 'connected' ? 'Déconnecter' : 'Connecter'}
                </button>
                <button className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs"
                  style={{ background: 'var(--bg-hover)', color: 'var(--text-tertiary)' }}>
                  <Settings size={12} />
                </button>
                <button onClick={() => handleRemove(plugin.id)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs ml-auto"
                  style={{ background: 'var(--bg-hover)', color: 'var(--accent-error)' }}>
                  <Trash2 size={12} />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Add modal */}
      <AnimatePresence>
        {showAddModal && (
          <>
            <motion.div className="fixed inset-0 z-50"
              style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)} />
            <motion.div className="fixed top-1/2 left-1/2 z-50 w-full max-w-md rounded-xl border overflow-hidden"
              style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-default)', transform: 'translate(-50%, -50%)' }}
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}>
              <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                <h2 className="text-h3" style={{ color: 'var(--text-primary)' }}>Ajouter un serveur MCP</h2>
              </div>
              <div className="px-5 py-4 space-y-3">
                <div className="space-y-1.5">
                  <label className="text-caption" style={{ color: 'var(--text-tertiary)' }}>Nom</label>
                  <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Mon serveur MCP"
                    className="w-full rounded-lg px-3 py-2 text-sm bg-transparent border outline-none"
                    style={{ borderColor: 'var(--border-default)', color: 'var(--text-primary)' }} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-caption" style={{ color: 'var(--text-tertiary)' }}>URL du serveur</label>
                  <input value={newUrl} onChange={(e) => setNewUrl(e.target.value)} placeholder="https://mcp.example.com"
                    className="w-full rounded-lg px-3 py-2 text-sm bg-transparent border outline-none mono"
                    style={{ borderColor: 'var(--border-default)', color: 'var(--text-primary)' }} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-caption" style={{ color: 'var(--text-tertiary)' }}>Description</label>
                  <input value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Description courte"
                    className="w-full rounded-lg px-3 py-2 text-sm bg-transparent border outline-none"
                    style={{ borderColor: 'var(--border-default)', color: 'var(--text-primary)' }} />
                </div>
              </div>
              <div className="flex justify-end gap-3 px-5 py-4 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                <button onClick={() => setShowAddModal(false)} className="rounded-lg px-4 py-2 text-sm"
                  style={{ color: 'var(--text-secondary)' }}>Annuler</button>
                <button onClick={handleAdd} disabled={!newName.trim()}
                  className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-40"
                  style={{ background: 'var(--accent-primary)', color: 'white' }}>
                  <Plug size={14} /> Ajouter
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
