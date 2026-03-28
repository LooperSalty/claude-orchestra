import { motion } from 'framer-motion';
import { Settings, Shield, Globe, Database, Palette, ChevronRight } from 'lucide-react';
import { useConfigStore } from '@/stores/configStore';

const SECTIONS = [
  { id: 'general', label: 'General', icon: Settings, description: 'Theme, langue, repertoire de travail', accent: 'var(--cyan)' },
  { id: 'models', label: 'Modeles', icon: Settings, description: 'Modele par defaut, fallback, limites', accent: 'var(--violet)' },
  { id: 'security', label: 'Securite', icon: Shield, description: 'Permissions, sandbox, tools autorises', accent: 'var(--red)' },
  { id: 'network', label: 'Reseau', icon: Globe, description: 'Proxy, domaines, timeout', accent: 'var(--green)' },
  { id: 'storage', label: 'Stockage', icon: Database, description: 'Base de donnees, retention, backup', accent: 'var(--amber)' },
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
    <div className="max-w-4xl" style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
      {/* Header */}
      <div>
        <h1 className="font-display font-bold tracking-tight" style={{ color: 'var(--text-0)', fontSize: '1.75rem' }}>
          Configuration
        </h1>
        <p style={{ color: 'var(--text-3)', fontSize: 13, marginTop: 8 }}>
          Parametres globaux de Claude Orchestra
        </p>
      </div>

      {/* Sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {SECTIONS.map((section, i) => {
          const Icon = section.icon;
          return (
            <motion.div
              key={section.id}
              custom={i}
              variants={cardVariants}
              initial="initial"
              animate="animate"
              className="card"
              style={{
                padding: '20px 24px', cursor: 'pointer',
                transition: 'all 0.2s ease',
                borderLeft: `3px solid ${section.accent}`,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-3)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = ''; }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="flex items-center justify-center shrink-0"
                  style={{
                    width: 42, height: 42, borderRadius: 12,
                    background: `${section.accent}12`,
                    boxShadow: `0 0 16px ${section.accent}08`,
                  }}
                >
                  <Icon size={18} style={{ color: section.accent }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div className="font-medium" style={{ color: 'var(--text-0)', fontSize: 14 }}>
                    {section.label}
                  </div>
                  <div style={{ color: 'var(--text-3)', fontSize: 12, marginTop: 2 }}>
                    {section.description}
                  </div>
                </div>
                <ChevronRight size={16} style={{ color: 'var(--text-4)' }} />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Theme toggle section */}
      <motion.div
        custom={SECTIONS.length}
        variants={cardVariants}
        initial="initial"
        animate="animate"
        className="card"
        style={{ padding: '24px' }}
      >
        <div className="flex items-center gap-3" style={{ marginBottom: 20 }}>
          <div className="flex items-center gap-2.5">
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--violet)', boxShadow: '0 0 8px rgba(139,92,246,0.4)' }} />
            <h3 className="font-display font-semibold" style={{ color: 'var(--text-1)', fontSize: 14 }}>
              Apparence
            </h3>
          </div>
        </div>

        <div className="flex items-center justify-between" style={{ padding: '14px 16px', borderRadius: 12, background: 'var(--bg-3)' }}>
          <div className="flex items-center gap-3">
            <Palette size={16} style={{ color: 'var(--violet)' }} />
            <div>
              <div style={{ color: 'var(--text-1)', fontSize: 13 }}>Theme</div>
              <div style={{ color: 'var(--text-4)', fontSize: 11 }}>Apparence de l'interface</div>
            </div>
          </div>
          <div
            style={{
              padding: '6px 14px', borderRadius: 8,
              background: 'var(--bg-4)', border: '1px solid var(--border-1)',
              color: 'var(--text-0)', fontSize: 12, fontWeight: 500,
            }}
          >
            {config.general.theme}
          </div>
        </div>

        {/* Toggle example */}
        <div className="flex items-center justify-between" style={{ padding: '14px 16px', borderRadius: 12, background: 'var(--bg-3)', marginTop: 8 }}>
          <div className="flex items-center gap-3">
            <Shield size={16} style={{ color: 'var(--green)' }} />
            <div>
              <div style={{ color: 'var(--text-1)', fontSize: 13 }}>Sandbox mode</div>
              <div style={{ color: 'var(--text-4)', fontSize: 11 }}>Isoler les sessions</div>
            </div>
          </div>
          {/* Custom toggle */}
          <div
            style={{
              width: 40, height: 22, borderRadius: 11, cursor: 'pointer',
              background: 'var(--green)', padding: 2,
              transition: 'background 0.2s ease',
              boxShadow: '0 0 10px rgba(0,255,136,0.2)',
            }}
          >
            <div style={{
              width: 18, height: 18, borderRadius: '50%',
              background: '#fff', transform: 'translateX(18px)',
              transition: 'transform 0.2s ease',
              boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
            }} />
          </div>
        </div>

        {/* Input example */}
        <div style={{ marginTop: 8, padding: '14px 16px', borderRadius: 12, background: 'var(--bg-3)' }}>
          <div className="flex items-center gap-3" style={{ marginBottom: 10 }}>
            <Globe size={16} style={{ color: 'var(--cyan)' }} />
            <div style={{ color: 'var(--text-1)', fontSize: 13 }}>Working directory</div>
          </div>
          <input
            type="text"
            defaultValue={config.general.defaultWorkDir || '~/projects'}
            style={{
              width: '100%', padding: '10px 14px', borderRadius: 10,
              background: 'var(--bg-4)', border: '1px solid var(--border-1)',
              color: 'var(--text-0)', fontSize: 13,
              fontFamily: 'var(--font-mono)',
              outline: 'none',
              transition: 'border-color 0.2s ease',
            }}
            onFocus={(e) => { e.target.style.borderColor = 'rgba(0,212,255,0.4)'; }}
            onBlur={(e) => { e.target.style.borderColor = 'var(--border-1)'; }}
          />
        </div>
      </motion.div>
    </div>
  );
}
