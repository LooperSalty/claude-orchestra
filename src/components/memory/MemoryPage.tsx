import { motion } from 'framer-motion';
import { Brain, FileText, FolderOpen } from 'lucide-react';

export function MemoryPage() {
  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-h1" style={{ color: 'var(--text-primary)' }}>
          Memory
        </h1>
        <p className="text-body mt-1" style={{ color: 'var(--text-secondary)' }}>
          Explorez et éditez les fichiers CLAUDE.md et la mémoire persistante
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border p-12 text-center"
        style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
      >
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: 'rgba(34, 211, 238, 0.15)', color: 'var(--accent-cyan)' }}
        >
          <Brain size={28} />
        </div>
        <h3 className="text-h3 mb-2" style={{ color: 'var(--text-primary)' }}>
          Memory Explorer
        </h3>
        <p className="text-body mb-6" style={{ color: 'var(--text-secondary)' }}>
          Scannez vos projets pour découvrir les fichiers de mémoire Claude Code.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm"
            style={{ background: 'var(--accent-primary)', color: 'white' }}
          >
            <FolderOpen size={16} />
            Scanner les projets
          </button>
          <button
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm border"
            style={{ borderColor: 'var(--border-default)', color: 'var(--text-secondary)' }}
          >
            <FileText size={16} />
            Créer un CLAUDE.md
          </button>
        </div>
      </motion.div>
    </div>
  );
}
