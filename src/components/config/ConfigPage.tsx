import { motion } from 'framer-motion';
import { Settings, Palette, Shield, Globe, Database } from 'lucide-react';
import { useConfigStore } from '@/stores/configStore';

const SECTIONS = [
  { id: 'general', label: 'Général', icon: Settings, description: 'Thème, langue, répertoire de travail' },
  { id: 'models', label: 'Modèles', icon: Settings, description: 'Modèle par défaut, fallback, limites' },
  { id: 'security', label: 'Sécurité', icon: Shield, description: 'Permissions, sandbox, tools autorisés' },
  { id: 'network', label: 'Réseau', icon: Globe, description: 'Proxy, domaines, timeout' },
  { id: 'storage', label: 'Stockage', icon: Database, description: 'Base de données, rétention, backup' },
] as const;

const cardVariants = {
  initial: { opacity: 0, scale: 0.95, y: 15 },
  animate: (i: number) => ({
    opacity: 1, scale: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as const },
  }),
};

export function ConfigPage() {
  const config = useConfigStore((s) => s.config);

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-h1" style={{ color: 'var(--text-primary)' }}>
          Configuration
        </h1>
        <p className="text-body mt-1" style={{ color: 'var(--text-secondary)' }}>
          Paramètres globaux de Claude Orchestra
        </p>
      </div>

      <div className="space-y-5">
        {SECTIONS.map((section, i) => {
          const Icon = section.icon;
          return (
            <motion.div
              key={section.id}
              custom={i}
              variants={cardVariants}
              initial="initial"
              animate="animate"
              className="rounded-xl border p-5 cursor-pointer transition-colors"
              style={{
                background: 'var(--bg-surface)',
                borderColor: 'var(--border-subtle)',
              }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: 'var(--bg-elevated)', color: 'var(--accent-primary)' }}
                >
                  <Icon size={18} />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {section.label}
                  </div>
                  <div className="text-small" style={{ color: 'var(--text-tertiary)' }}>
                    {section.description}
                  </div>
                </div>
                <span style={{ color: 'var(--text-ghost)' }}>→</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Current theme indicator */}
      <div
        className="rounded-xl border p-5"
        style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
      >
        <div className="flex items-center gap-3">
          <Palette size={16} style={{ color: 'var(--accent-purple)' }} />
          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Thème actuel : <strong style={{ color: 'var(--text-primary)' }}>{config.general.theme}</strong>
          </span>
        </div>
      </div>
    </div>
  );
}
