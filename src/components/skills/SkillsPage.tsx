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
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-h1" style={{ color: 'var(--text-0)' }}>Skills</h1>
          <p className="text-body mt-1" style={{ color: 'var(--text-2)' }}>
            {enabledCount} activés sur {skills.length} installés
          </p>
        </div>
        <button className="btn-primary flex items-center gap-2 px-4 py-2 text-sm whitespace-nowrap shrink-0"
          style={{ borderRadius: 'var(--r-md)' }}>
          <Plus size={16} /> Créer un skill
        </button>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3 px-4 py-3 border"
          style={{
            background: 'var(--bg-3)',
            borderColor: 'var(--border-1)',
            borderRadius: 'var(--r-md)',
          }}>
          <Search size={16} style={{ color: 'var(--text-3)' }} />
          <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un skill..." className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: 'var(--text-0)' }} />
        </div>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button key={c.value} onClick={() => setFilterCategory(c.value)}
              className="px-3 py-1.5 text-xs transition-colors rounded-lg"
              style={{
                background: filterCategory === c.value ? 'var(--cyan-glow)' : 'var(--bg-2)',
                color: filterCategory === c.value ? 'var(--cyan)' : 'var(--text-4)',
                border: `1px solid ${filterCategory === c.value ? 'var(--cyan)' : 'var(--border-1)'}`,
              }}>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
        {filtered.map((skill, i) => (
          <motion.div key={skill.id} custom={i} variants={cardVariants} initial="initial" animate="animate"
            className="card card-glow-cyan noise p-5 cursor-pointer group"
            style={{ opacity: skill.isEnabled ? 1 : 0.6 }}
            onClick={() => setDetailSkill(skill)}>
            <div className="flex items-start justify-between mb-3">
              <span className="text-2xl">{skill.icon ?? '⚡'}</span>
              <button onClick={(e) => { e.stopPropagation(); toggleSkill(skill.id); }}
                className="p-1.5 rounded-lg transition-colors"
                style={{ color: skill.isEnabled ? 'var(--green)' : 'var(--text-4)' }}>
                <Power size={14} />
              </button>
            </div>
            <div className="text-sm font-semibold mb-1 truncate" style={{ color: 'var(--text-0)' }}>
              {skill.name}
            </div>
            <div className="text-xs mb-2" style={{ color: 'var(--text-3)' }}>
              {skill.version} · {skill.isBuiltin ? 'builtin' : 'community'}
            </div>
            {skill.description && (
              <p className="text-xs line-clamp-2 mb-3" style={{ color: 'var(--text-2)' }}>
                {skill.description}
              </p>
            )}
            <div className="mt-auto flex items-center">
              <span className="text-xs px-2.5 py-1 rounded-lg"
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
              style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setDetailSkill(null)} />
            <motion.div className="fixed top-1/2 left-1/2 z-50 w-full max-w-md glass overflow-hidden"
              style={{ borderRadius: 'var(--r-xl)', transform: 'translate(-50%, -50%)' }}
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}>
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{detailSkill.icon}</span>
                  <div className="min-w-0">
                    <h3 className="text-h3 truncate" style={{ color: 'var(--text-0)' }}>{detailSkill.name}</h3>
                    <div className="text-small" style={{ color: 'var(--text-3)' }}>
                      {detailSkill.version} · {detailSkill.isBuiltin ? 'Built-in' : 'Community'}
                    </div>
                  </div>
                </div>
                <p className="text-body" style={{ color: 'var(--text-2)' }}>{detailSkill.description}</p>
                <div className="flex gap-2">
                  <button onClick={() => { toggleSkill(detailSkill.id); setDetailSkill({ ...detailSkill, isEnabled: !detailSkill.isEnabled }); }}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium flex-1 justify-center"
                    style={{
                      borderRadius: 'var(--r-md)',
                      background: detailSkill.isEnabled ? 'var(--red-glow)' : 'var(--green-glow)',
                      color: detailSkill.isEnabled ? 'var(--red)' : 'var(--green)',
                    }}>
                    <Power size={14} /> {detailSkill.isEnabled ? 'Désactiver' : 'Activer'}
                  </button>
                  <button onClick={() => setDetailSkill(null)}
                    className="btn-ghost px-4 py-2.5 text-sm"
                    style={{ borderRadius: 'var(--r-md)' }}>
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
