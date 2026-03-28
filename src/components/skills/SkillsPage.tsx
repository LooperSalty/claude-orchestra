import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Power } from 'lucide-react';
import { useSkillStore } from '@/stores/skillStore';
import type { Skill, SkillCategory } from '@/types/skill';
import { SKILL_CATEGORY_COLORS } from '@/types/skill';

const cardVariants = {
  initial: { opacity: 0, scale: 0.95, y: 15 },
  animate: (i: number) => ({
    opacity: 1, scale: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as const },
  }),
};

const CATEGORIES: { value: SkillCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'Tous' },
  { value: 'code', label: 'Code' },
  { value: 'document', label: 'Document' },
  { value: 'data', label: 'Data' },
  { value: 'design', label: 'Design' },
  { value: 'ai', label: 'AI' },
  { value: 'integration', label: 'Integration' },
  { value: 'custom', label: 'Custom' },
];

const DEMO_SKILLS: Omit<Skill, 'id' | 'installedAt'>[] = [
  { name: 'TDD Workflow', description: 'Test-driven development with 80%+ coverage', path: '', version: 'v2.1', category: 'code', icon: '🧪', isBuiltin: true, isEnabled: true, config: {} },
  { name: 'Code Review', description: 'Comprehensive code review for quality and security', path: '', version: 'v1.8', category: 'code', icon: '🔍', isBuiltin: true, isEnabled: true, config: {} },
  { name: 'Security Review', description: 'OWASP Top 10, injection, XSS prevention', path: '', version: 'v3.0', category: 'code', icon: '🛡️', isBuiltin: true, isEnabled: true, config: {} },
  { name: 'Frontend Design', description: 'Production-grade UI with shadcn/ui patterns', path: '', version: 'v2.4', category: 'design', icon: '🎨', isBuiltin: true, isEnabled: false, config: {} },
  { name: 'Artifacts Builder', description: 'Multi-component HTML artifacts with React', path: '', version: 'v1.5', category: 'document', icon: '📄', isBuiltin: true, isEnabled: true, config: {} },
  { name: 'MCP Builder', description: 'Build MCP servers for external API integration', path: '', version: 'v1.0', category: 'integration', icon: '🔌', isBuiltin: true, isEnabled: false, config: {} },
  { name: 'AI SDK', description: 'Build AI features with Vercel AI SDK patterns', path: '', version: 'v6.0', category: 'ai', icon: '🤖', isBuiltin: true, isEnabled: true, config: {} },
  { name: 'Django Patterns', description: 'Django REST, ORM, caching best practices', path: '', version: 'v1.3', category: 'code', icon: '🐍', isBuiltin: false, isEnabled: true, config: {} },
  { name: 'Canvas Design', description: 'Visual art in PNG/PDF with design philosophy', path: '', version: 'v1.2', category: 'design', icon: '🖼️', isBuiltin: false, isEnabled: false, config: {} },
  { name: 'Postgres Patterns', description: 'Query optimization, indexing, schema design', path: '', version: 'v2.0', category: 'data', icon: '🗄️', isBuiltin: false, isEnabled: true, config: {} },
  { name: 'Go Patterns', description: 'Idiomatic Go, concurrency, error handling', path: '', version: 'v1.7', category: 'code', icon: '🦫', isBuiltin: false, isEnabled: false, config: {} },
  { name: 'Changelog Generator', description: 'User-facing changelogs from git commits', path: '', version: 'v1.0', category: 'document', icon: '📋', isBuiltin: false, isEnabled: true, config: {} },
];

export function SkillsPage() {
  const { skills, setSkills, toggleSkill, searchQuery, setSearchQuery, filterCategory, setFilterCategory, filteredSkills } = useSkillStore();
  const [detailSkill, setDetailSkill] = useState<Skill | null>(null);

  // Load demo skills on first visit
  useEffect(() => {
    if (skills.length === 0) {
      const now = new Date().toISOString();
      setSkills(DEMO_SKILLS.map((s) => ({ ...s, id: crypto.randomUUID(), installedAt: now })));
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = filteredSkills();
  const enabledCount = skills.filter((s) => s.isEnabled).length;

  return (
    <div className="space-y-5 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h1" style={{ color: 'var(--text-primary)' }}>Skills</h1>
          <p className="text-body mt-1" style={{ color: 'var(--text-secondary)' }}>
            {enabledCount} activés sur {skills.length} installés
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium"
          style={{ background: 'var(--accent-purple)', color: 'white' }}>
          <Plus size={16} /> Créer un skill
        </button>
      </div>

      {/* Search + Filters */}
      <div className="flex gap-3">
        <div className="flex-1 flex items-center gap-3 rounded-lg px-4 py-2.5 border"
          style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}>
          <Search size={16} style={{ color: 'var(--text-tertiary)' }} />
          <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un skill..." className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: 'var(--text-primary)' }} />
        </div>
        <div className="flex rounded-lg border overflow-hidden" style={{ borderColor: 'var(--border-default)' }}>
          {CATEGORIES.map((c) => (
            <button key={c.value} onClick={() => setFilterCategory(c.value)}
              className="px-3 py-2 text-xs transition-colors"
              style={{
                background: filterCategory === c.value ? 'var(--accent-primary-glow)' : 'transparent',
                color: filterCategory === c.value ? 'var(--accent-primary)' : 'var(--text-ghost)',
              }}>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
        {filtered.map((skill, i) => (
          <motion.div key={skill.id} custom={i} variants={cardVariants} initial="initial" animate="animate"
            className="rounded-xl border p-4 cursor-pointer group transition-all duration-200"
            style={{
              background: 'var(--bg-surface)',
              borderColor: skill.isEnabled ? 'var(--border-default)' : 'var(--border-subtle)',
              opacity: skill.isEnabled ? 1 : 0.6,
            }}
            onClick={() => setDetailSkill(skill)}>
            <div className="flex items-start justify-between mb-2">
              <span className="text-2xl">{skill.icon ?? '⚡'}</span>
              <button onClick={(e) => { e.stopPropagation(); toggleSkill(skill.id); }}
                className="p-1 rounded-lg transition-colors"
                style={{ color: skill.isEnabled ? 'var(--accent-success)' : 'var(--text-ghost)' }}>
                <Power size={14} />
              </button>
            </div>
            <div className="text-sm font-semibold mb-0.5" style={{ color: 'var(--text-primary)' }}>
              {skill.name}
            </div>
            <div className="text-xs mb-2" style={{ color: 'var(--text-tertiary)' }}>
              {skill.version} · {skill.isBuiltin ? 'builtin' : 'community'}
            </div>
            {skill.description && (
              <p className="text-xs line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                {skill.description}
              </p>
            )}
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs px-2 py-0.5 rounded-full"
                style={{
                  background: `${SKILL_CATEGORY_COLORS[skill.category]}15`,
                  color: SKILL_CATEGORY_COLORS[skill.category],
                }}>
                {skill.category}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Detail panel */}
      <AnimatePresence>
        {detailSkill && (
          <>
            <motion.div className="fixed inset-0 z-50"
              style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setDetailSkill(null)} />
            <motion.div className="fixed top-1/2 left-1/2 z-50 w-full max-w-md rounded-xl border overflow-hidden"
              style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-default)', transform: 'translate(-50%, -50%)' }}
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}>
              <div className="p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{detailSkill.icon}</span>
                  <div>
                    <h3 className="text-h3" style={{ color: 'var(--text-primary)' }}>{detailSkill.name}</h3>
                    <div className="text-small" style={{ color: 'var(--text-tertiary)' }}>
                      {detailSkill.version} · {detailSkill.isBuiltin ? 'Built-in' : 'Community'}
                    </div>
                  </div>
                </div>
                <p className="text-body" style={{ color: 'var(--text-secondary)' }}>{detailSkill.description}</p>
                <div className="flex gap-2">
                  <button onClick={() => { toggleSkill(detailSkill.id); setDetailSkill({ ...detailSkill, isEnabled: !detailSkill.isEnabled }); }}
                    className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium flex-1 justify-center"
                    style={{
                      background: detailSkill.isEnabled ? 'var(--accent-error-glow)' : 'var(--accent-success-glow)',
                      color: detailSkill.isEnabled ? 'var(--accent-error)' : 'var(--accent-success)',
                    }}>
                    <Power size={14} /> {detailSkill.isEnabled ? 'Désactiver' : 'Activer'}
                  </button>
                  <button onClick={() => setDetailSkill(null)}
                    className="rounded-lg px-4 py-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Fermer
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
