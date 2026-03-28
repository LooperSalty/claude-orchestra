import { motion } from 'framer-motion';
import { Sparkles, Search, Plus } from 'lucide-react';
import { useSkillStore } from '@/stores/skillStore';

const cardVariants = {
  initial: { opacity: 0, scale: 0.95, y: 15 },
  animate: (i: number) => ({
    opacity: 1, scale: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as const },
  }),
};

export function SkillsPage() {
  const { searchQuery, setSearchQuery } = useSkillStore();
  const skills = useSkillStore((s) => s.filteredSkills());

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h1" style={{ color: 'var(--text-primary)' }}>
            Skills
          </h1>
          <p className="text-body mt-1" style={{ color: 'var(--text-secondary)' }}>
            Capacités et extensions installées
          </p>
        </div>
        <button
          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium"
          style={{ background: 'var(--accent-purple)', color: 'white' }}
        >
          <Plus size={16} />
          Créer un skill
        </button>
      </div>

      {/* Search */}
      <div
        className="flex items-center gap-3 rounded-lg px-4 py-2.5 border"
        style={{
          background: 'var(--bg-surface)',
          borderColor: 'var(--border-default)',
        }}
      >
        <Search size={16} style={{ color: 'var(--text-tertiary)' }} />
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Rechercher un skill..."
          className="flex-1 bg-transparent outline-none text-sm"
          style={{ color: 'var(--text-primary)' }}
        />
      </div>

      {skills.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border p-12 text-center"
          style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(167, 139, 250, 0.15)', color: 'var(--accent-purple)' }}
          >
            <Sparkles size={28} />
          </div>
          <h3 className="text-h3 mb-2" style={{ color: 'var(--text-primary)' }}>
            Aucun skill trouvé
          </h3>
          <p className="text-body" style={{ color: 'var(--text-secondary)' }}>
            Scannez votre installation Claude Code pour détecter les skills disponibles.
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {skills.map((skill, i) => (
            <motion.div
              key={skill.id}
              custom={i}
              variants={cardVariants}
              initial="initial"
              animate="animate"
              className="rounded-xl border p-4 cursor-pointer"
              style={{
                background: 'var(--bg-surface)',
                borderColor: 'var(--border-subtle)',
              }}
            >
              <div className="text-2xl mb-2">{skill.icon ?? '⚡'}</div>
              <div className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                {skill.name}
              </div>
              <div className="text-small mb-2" style={{ color: 'var(--text-tertiary)' }}>
                {skill.version ?? 'v1.0'}
              </div>
              <span
                className="text-xs px-2 py-0.5 rounded-full"
                style={{
                  background: skill.isEnabled ? 'var(--accent-success-glow)' : 'var(--bg-hover)',
                  color: skill.isEnabled ? 'var(--accent-success)' : 'var(--text-ghost)',
                }}
              >
                {skill.isEnabled ? 'ON' : 'OFF'}
              </span>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
