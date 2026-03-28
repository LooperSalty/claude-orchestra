import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FolderOpen, Play, ChevronDown, Loader2 } from 'lucide-react';
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
      const { open: openDialog } = await import('@tauri-apps/plugin-dialog');
      const selected = await openDialog({
        directory: true,
        multiple: false,
        title: 'Choisir le dossier du projet',
      });
      if (selected) {
        setProjectPath(selected as string);
      }
    } catch {
      // Fallback for browser dev mode
      const path = prompt('Chemin du projet :');
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

  const inputStyle = {
    background: 'var(--bg-4)',
    border: '1px solid var(--border-1)',
    color: 'var(--text-0)',
    fontSize: 14,
    borderRadius: 12,
    padding: '11px 16px',
    outline: 'none',
    width: '100%',
    transition: 'border-color 0.2s',
  } as const;

  const selectStyle = {
    ...inputStyle,
    appearance: 'none' as const,
    cursor: 'pointer',
    paddingRight: 40,
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50"
            style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal container */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 pointer-events-none">
            <motion.div
              className="pointer-events-auto w-full"
              style={{ maxWidth: 520 }}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 10 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              <div
                className="rounded-2xl overflow-hidden"
                style={{
                  background: 'var(--bg-2)',
                  border: '1px solid var(--border-1)',
                  boxShadow: '0 24px 80px rgba(0,0,0,0.6), 0 0 40px rgba(0,212,255,0.04)',
                }}
              >
                {/* Header */}
                <div
                  className="flex items-center justify-between border-b"
                  style={{
                    padding: '20px 24px',
                    borderColor: 'var(--border-0)',
                  }}
                >
                  <h2
                    className="font-display font-semibold"
                    style={{ color: 'var(--text-0)', fontSize: 17 }}
                  >
                    Nouvelle session
                  </h2>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-lg transition-colors"
                    style={{ color: 'var(--text-3)', background: 'transparent', border: 'none', cursor: 'pointer' }}
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Body */}
                <div style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {/* Project Path */}
                    <div>
                      <label
                        className="text-caption block"
                        style={{ color: 'var(--text-3)', marginBottom: 8 }}
                      >
                        Répertoire du projet
                      </label>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <input
                          value={projectPath}
                          onChange={(e) => setProjectPath(e.target.value)}
                          placeholder="C:\Users\...\mon-projet"
                          className="mono"
                          style={{ ...inputStyle, flex: 1 }}
                        />
                        <button
                          onClick={handleSelectFolder}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            padding: '11px 16px',
                            borderRadius: 12,
                            border: '1px solid var(--border-1)',
                            background: 'var(--bg-4)',
                            color: 'var(--cyan)',
                            fontSize: 13,
                            fontWeight: 500,
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            transition: 'border-color 0.2s',
                          }}
                        >
                          <FolderOpen size={15} />
                          Parcourir
                        </button>
                      </div>
                    </div>

                    {/* Model */}
                    <div>
                      <label
                        className="text-caption block"
                        style={{ color: 'var(--text-3)', marginBottom: 8 }}
                      >
                        Modèle
                      </label>
                      <div style={{ position: 'relative' }}>
                        <select
                          value={model}
                          onChange={(e) => setModel(e.target.value as ClaudeModel)}
                          style={selectStyle}
                        >
                          {MODELS.map((m) => (
                            <option key={m.value} value={m.value}>{m.label}</option>
                          ))}
                        </select>
                        <ChevronDown
                          size={14}
                          style={{
                            position: 'absolute',
                            right: 16,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            pointerEvents: 'none',
                            color: 'var(--text-3)',
                          }}
                        />
                      </div>
                    </div>

                    {/* Agent */}
                    {agents.length > 0 && (
                      <div>
                        <label
                          className="text-caption block"
                          style={{ color: 'var(--text-3)', marginBottom: 8 }}
                        >
                          Agent (optionnel)
                        </label>
                        <div style={{ position: 'relative' }}>
                          <select
                            value={agentId}
                            onChange={(e) => setAgentId(e.target.value)}
                            style={selectStyle}
                          >
                            <option value="">Par défaut</option>
                            {agents.map((a) => (
                              <option key={a.id} value={a.id}>{a.name}</option>
                            ))}
                          </select>
                          <ChevronDown
                            size={14}
                            style={{
                              position: 'absolute',
                              right: 16,
                              top: '50%',
                              transform: 'translateY(-50%)',
                              pointerEvents: 'none',
                              color: 'var(--text-3)',
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Extra Args */}
                    <div>
                      <label
                        className="text-caption block"
                        style={{ color: 'var(--text-3)', marginBottom: 8 }}
                      >
                        Arguments CLI supplémentaires
                      </label>
                      <input
                        value={extraArgs}
                        onChange={(e) => setExtraArgs(e.target.value)}
                        placeholder="--verbose --output-format json"
                        className="mono"
                        style={inputStyle}
                      />
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div
                  className="flex items-center justify-end border-t"
                  style={{
                    padding: '16px 24px',
                    borderColor: 'var(--border-0)',
                    gap: 12,
                  }}
                >
                  <button
                    onClick={onClose}
                    style={{
                      padding: '10px 20px',
                      borderRadius: 12,
                      border: '1px solid var(--border-1)',
                      background: 'transparent',
                      color: 'var(--text-2)',
                      fontSize: 13,
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleLaunch}
                    disabled={!projectPath || isLaunching}
                    className="btn-primary"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '10px 24px',
                      borderRadius: 12,
                      fontSize: 13,
                      fontWeight: 600,
                      opacity: (!projectPath || isLaunching) ? 0.4 : 1,
                      cursor: (!projectPath || isLaunching) ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {isLaunching ? (
                      <>
                        <Loader2 size={15} className="animate-spin" />
                        Lancement...
                      </>
                    ) : (
                      <>
                        <Play size={15} />
                        Lancer la session
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
