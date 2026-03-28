import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FolderOpen, Play, ChevronDown } from 'lucide-react';
import { useAgentStore } from '@/stores/agentStore';
import { useSession } from '@/hooks/useSession';
import type { ClaudeModel } from '@/types/agent';

interface NewSessionModalProps {
  open: boolean;
  onClose: () => void;
}

const MODELS: { value: ClaudeModel; label: string }[] = [
  { value: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6' },
  { value: 'claude-opus-4-6', label: 'Claude Opus 4.6' },
  { value: 'claude-haiku-4-5-20251001', label: 'Claude Haiku 4.5' },
];

export function NewSessionModal({ open, onClose }: NewSessionModalProps) {
  const [projectPath, setProjectPath] = useState('');
  const [model, setModel] = useState<ClaudeModel>('claude-sonnet-4-6');
  const [agentId, setAgentId] = useState<string>('');
  const [extraArgs, setExtraArgs] = useState('');
  const [isLaunching, setIsLaunching] = useState(false);

  const agents = useAgentStore((s) => s.agents);
  const { createSession } = useSession();

  async function handleSelectFolder() {
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      const selected = await invoke<string | null>('plugin:dialog|open', {
        directory: true,
        title: 'Select project directory',
      });
      if (selected) {
        setProjectPath(selected);
      }
    } catch {
      const path = prompt('Project path:');
      if (path) setProjectPath(path);
    }
  }

  async function handleLaunch() {
    if (!projectPath) return;
    setIsLaunching(true);

    try {
      await createSession(projectPath, model, extraArgs ? extraArgs.split(' ') : []);
      onClose();
      resetForm();
    } catch (err) {
      console.error('Failed to launch session:', err);
    } finally {
      setIsLaunching(false);
    }
  }

  function resetForm() {
    setProjectPath('');
    setModel('claude-sonnet-4-6');
    setAgentId('');
    setExtraArgs('');
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-50"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-8 pointer-events-none"
          >
          <motion.div
            className="glass w-full max-w-lg rounded-2xl border overflow-hidden pointer-events-auto"
            style={{
              background: 'var(--bg-3)',
              borderColor: 'var(--border-1)',
              boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
            }}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-6 py-5 border-b"
              style={{ borderColor: 'var(--border-0)' }}
            >
              <h2 className="text-h3" style={{ color: 'var(--text-0)' }}>
                Nouvelle session
              </h2>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg transition-colors"
                style={{ color: 'var(--text-3)' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-5">
              {/* Project Path */}
              <div className="space-y-2">
                <label className="text-caption block" style={{ color: 'var(--text-3)' }}>
                  Répertoire du projet
                </label>
                <div className="flex gap-2">
                  <input
                    value={projectPath}
                    onChange={(e) => setProjectPath(e.target.value)}
                    placeholder="/path/to/project"
                    className="flex-1 rounded-xl px-4 py-3 text-sm border outline-none mono"
                    style={{
                      background: 'var(--bg-4)',
                      borderColor: 'var(--border-1)',
                      color: 'var(--text-0)',
                      fontSize: '14px',
                    }}
                  />
                  <button
                    onClick={handleSelectFolder}
                    className="btn-ghost flex items-center gap-1.5 rounded-xl px-4 py-3 text-sm"
                    style={{
                      color: 'var(--cyan)',
                    }}
                  >
                    <FolderOpen size={14} />
                    Browse
                  </button>
                </div>
              </div>

              {/* Model */}
              <div className="space-y-2">
                <label className="text-caption block" style={{ color: 'var(--text-3)' }}>
                  Modèle
                </label>
                <div className="relative">
                  <select
                    value={model}
                    onChange={(e) => setModel(e.target.value as ClaudeModel)}
                    className="w-full rounded-xl px-4 py-3 text-sm border outline-none appearance-none cursor-pointer"
                    style={{
                      background: 'var(--bg-4)',
                      borderColor: 'var(--border-1)',
                      color: 'var(--text-0)',
                      fontSize: '14px',
                    }}
                  >
                    {MODELS.map((m) => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                  <ChevronDown
                    size={14}
                    className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: 'var(--text-3)' }}
                  />
                </div>
              </div>

              {/* Agent */}
              {agents.length > 0 && (
                <div className="space-y-2">
                  <label className="text-caption block" style={{ color: 'var(--text-3)' }}>
                    Agent (optionnel)
                  </label>
                  <div className="relative">
                    <select
                      value={agentId}
                      onChange={(e) => setAgentId(e.target.value)}
                      className="w-full rounded-xl px-4 py-3 text-sm border outline-none appearance-none cursor-pointer"
                      style={{
                        background: 'var(--bg-4)',
                        borderColor: 'var(--border-1)',
                        color: 'var(--text-0)',
                        fontSize: '14px',
                      }}
                    >
                      <option value="">Par défaut</option>
                      {agents.map((a) => (
                        <option key={a.id} value={a.id}>{a.name}</option>
                      ))}
                    </select>
                    <ChevronDown
                      size={14}
                      className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"
                      style={{ color: 'var(--text-3)' }}
                    />
                  </div>
                </div>
              )}

              {/* Extra Args */}
              <div className="space-y-2">
                <label className="text-caption block" style={{ color: 'var(--text-3)' }}>
                  Arguments CLI supplémentaires
                </label>
                <input
                  value={extraArgs}
                  onChange={(e) => setExtraArgs(e.target.value)}
                  placeholder="--verbose --output-format json"
                  className="w-full rounded-xl px-4 py-3 text-sm border outline-none mono"
                  style={{
                    background: 'var(--bg-4)',
                    borderColor: 'var(--border-1)',
                    color: 'var(--text-0)',
                    fontSize: '14px',
                  }}
                />
              </div>
            </div>

            {/* Footer */}
            <div
              className="flex items-center justify-end gap-3 px-6 py-4 border-t"
              style={{ borderColor: 'var(--border-0)' }}
            >
              <button
                onClick={onClose}
                className="btn-ghost rounded-xl px-4 py-2.5 text-sm"
                style={{ color: 'var(--text-2)' }}
              >
                Annuler
              </button>
              <button
                onClick={handleLaunch}
                disabled={!projectPath || isLaunching}
                className="btn-primary flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-opacity disabled:opacity-40"
              >
                <Play size={14} />
                {isLaunching ? 'Lancement...' : 'Lancer la session'}
              </button>
            </div>
          </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
