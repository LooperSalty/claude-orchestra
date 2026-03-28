import { motion } from 'framer-motion';
import { BarChart3 } from 'lucide-react';

export function MetricsPage() {
  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-h1" style={{ color: 'var(--text-primary)' }}>
          Métriques
        </h1>
        <p className="text-body mt-1" style={{ color: 'var(--text-secondary)' }}>
          Utilisation des tokens, coûts et performance
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
          style={{ background: 'var(--accent-warning-glow)', color: 'var(--accent-warning)' }}
        >
          <BarChart3 size={28} />
        </div>
        <h3 className="text-h3 mb-2" style={{ color: 'var(--text-primary)' }}>
          Pas encore de données
        </h3>
        <p className="text-body" style={{ color: 'var(--text-secondary)' }}>
          Les métriques apparaîtront une fois que vous aurez des sessions actives.
        </p>
      </motion.div>
    </div>
  );
}
