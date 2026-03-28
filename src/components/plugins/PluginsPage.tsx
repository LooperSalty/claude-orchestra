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
  connected: { icon: Wifi, color: 'var(--green)', label: 'Connecté' },
  disconnected: { icon: WifiOff, color: 'var(--text-4)', label: 'Déconnecté' },
  error: { icon: AlertCircle, color: 'var(--red)', label: 'Erreur' },
};

const PLUGIN_ICONS: Record<string, string> = {
  GitHub: '🐙', Slack: '💬', Figma: '🎨', PostgreSQL: '🗄️', Context7: '📚', 'Roblox Studio': '🎮',
};

const STATUS_GLOW: Record<PluginStatus, string> = {
  connected: 'card-glow-green',
  disconnected: '',
  error: '',
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
          <h1 className="text-h1" style={{ color: 'var(--text-0)' }}>Plugins & MCP</h1>
          <p className="text-body mt-1" style={{ color: 'var(--text-2)' }}>
            {connected} connectés sur {plugins.length} configurés
          </p>
        </div>
        <button onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center gap-2 px-4 py-2 text-sm"
          style={{ borderRadius: 'var(--r-md)' }}>
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
            <div key={status} className="card flex items-center gap-2 px-3 py-2">
              <Icon size={14} style={{ color: cfg.color }} />
              <span className="text-sm" style={{ color: 'var(--text-2)' }}>
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
              className={`card ${STATUS_GLOW[plugin.status]} noise p-5`}
              style={{
                borderColor: plugin.status === 'connected' ? 'rgba(0,255,136,0.2)' :
                  plugin.status === 'error' ? 'rgba(255,51,102,0.2)' : undefined,
              }}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{PLUGIN_ICONS[plugin.name] ?? '🔌'}</span>
                  <div>
                    <div className="text-sm font-semibold" style={{ color: 'var(--text-0)' }}>{plugin.name}</div>
                    <div className="flex items-center gap-1.5 text-xs mt-0.5">
                      <span className={`status-dot ${
                        plugin.status === 'connected' ? 'status-live' :
                        plugin.status === 'error' ? 'status-error' : 'status-idle'
                      }`} />
                      <span style={{ color: cfg.color }}>{cfg.label}</span>
                    </div>
                  </div>
                </div>
              </div>

              {plugin.description && (
                <p className="text-xs mb-3" style={{ color: 'var(--text-2)' }}>{plugin.description}</p>
              )}

              {plugin.url && (
                <div className="text-xs mono mb-3 truncate" style={{ color: 'var(--text-4)' }}>{plugin.url}</div>
              )}

              <div className="flex gap-1.5">
                <button onClick={() => handleToggle(plugin.id)}
                  className="btn-ghost flex items-center gap-1 px-2.5 py-1.5 text-xs"
                  style={{
                    borderRadius: 'var(--r-sm)',
                    color: plugin.status === 'connected' ? 'var(--red)' : 'var(--green)',
                  }}>
                  <StatusIcon size={12} /> {plugin.status === 'connected' ? 'Déconnecter' : 'Connecter'}
                </button>
                <button className="btn-ghost flex items-center gap-1 px-2.5 py-1.5 text-xs"
                  style={{ borderRadius: 'var(--r-sm)', color: 'var(--text-3)' }}>
                  <Settings size={12} />
                </button>
                <button onClick={() => handleRemove(plugin.id)}
                  className="btn-ghost flex items-center gap-1 px-2.5 py-1.5 text-xs ml-auto"
                  style={{ borderRadius: 'var(--r-sm)', color: 'var(--red)' }}>
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
              style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)} />
            <motion.div className="fixed top-1/2 left-1/2 z-50 w-full max-w-md glass overflow-hidden"
              style={{ borderRadius: 'var(--r-xl)', transform: 'translate(-50%, -50%)' }}
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}>
              <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border-0)' }}>
                <h2 className="text-h3" style={{ color: 'var(--text-0)' }}>Ajouter un serveur MCP</h2>
              </div>
              <div className="px-5 py-4 space-y-3">
                <div className="space-y-1.5">
                  <label className="text-caption" style={{ color: 'var(--text-3)' }}>Nom</label>
                  <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Mon serveur MCP"
                    className="w-full px-3 py-2 text-sm bg-transparent border outline-none"
                    style={{ borderColor: 'var(--border-1)', color: 'var(--text-0)', borderRadius: 'var(--r-md)' }} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-caption" style={{ color: 'var(--text-3)' }}>URL du serveur</label>
                  <input value={newUrl} onChange={(e) => setNewUrl(e.target.value)} placeholder="https://mcp.example.com"
                    className="w-full px-3 py-2 text-sm bg-transparent border outline-none mono"
                    style={{ borderColor: 'var(--border-1)', color: 'var(--text-0)', borderRadius: 'var(--r-md)' }} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-caption" style={{ color: 'var(--text-3)' }}>Description</label>
                  <input value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Description courte"
                    className="w-full px-3 py-2 text-sm bg-transparent border outline-none"
                    style={{ borderColor: 'var(--border-1)', color: 'var(--text-0)', borderRadius: 'var(--r-md)' }} />
                </div>
              </div>
              <div className="flex justify-end gap-3 px-5 py-4 border-t" style={{ borderColor: 'var(--border-0)' }}>
                <button onClick={() => setShowAddModal(false)}
                  className="btn-ghost px-4 py-2 text-sm"
                  style={{ borderRadius: 'var(--r-md)' }}>
                  Annuler
                </button>
                <button onClick={handleAdd} disabled={!newName.trim()}
                  className="btn-primary flex items-center gap-2 px-4 py-2 text-sm disabled:opacity-40"
                  style={{ borderRadius: 'var(--r-md)' }}>
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
