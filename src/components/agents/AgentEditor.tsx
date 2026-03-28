import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, ChevronDown, Trash2 } from 'lucide-react';
import { useAgentStore } from '@/stores/agentStore';
import type { AgentConfig, ClaudeModel } from '@/types/agent';

interface AgentEditorProps {
  agent?: AgentConfig;
  open: boolean;
  onClose: () => void;
}

const MODELS: { value: ClaudeModel; label: string }[] = [
  { value: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6' },
  { value: 'claude-opus-4-6', label: 'Claude Opus 4.6' },
  { value: 'claude-haiku-4-5-20251001', label: 'Claude Haiku 4.5' },
];

export function AgentEditor({ agent, open, onClose }: AgentEditorProps) {
  const { addAgent, updateAgent, removeAgent } = useAgentStore();
  const isEditing = !!agent;

  const [name, setName] = useState(agent?.name ?? '');
  const [description, setDescription] = useState(agent?.description ?? '');
  const [model, setModel] = useState<ClaudeModel>(agent?.model ?? 'claude-sonnet-4-6');
  const [systemPrompt, setSystemPrompt] = useState(agent?.systemPrompt ?? '');
  const [claudeMdTemplate, setClaudeMdTemplate] = useState(agent?.claudeMdTemplate ?? '');
  const [maxTokens, setMaxTokens] = useState(agent?.maxTokens ?? 8192);
  const [temperature, setTemperature] = useState(agent?.temperature ?? 0);

  function handleSave() {
    if (!name.trim()) return;
    const now = new Date().toISOString();

    if (isEditing && agent) {
      updateAgent(agent.id, {
        name, description, model, systemPrompt, claudeMdTemplate,
        maxTokens, temperature, updatedAt: now,
      });
    } else {
      const newAgent: AgentConfig = {
        id: crypto.randomUUID(),
        name, description, model, systemPrompt, claudeMdTemplate,
        maxTokens, temperature,
        toolsEnabled: [], mcpServers: [],
        createdAt: now, updatedAt: now,
      };
      addAgent(newAgent);
    }
    onClose();
  }

  function handleDelete() {
    if (agent) {
      removeAgent(agent.id);
      onClose();
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-50"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed top-1/2 left-1/2 z-50 w-full max-w-2xl max-h-[85vh] glass rounded-2xl border overflow-hidden flex flex-col"
            style={{
              background: 'var(--bg-3)', borderColor: 'var(--border-1)',
              transform: 'translate(-50%, -50%)',
              boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
            }}
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b shrink-0"
              style={{ borderColor: 'var(--border-0)' }}>
              <h2 className="text-h3" style={{ color: 'var(--text-0)' }}>
                {isEditing ? `Éditer ${agent.name}` : 'Nouvel agent'}
              </h2>
              <button onClick={onClose} className="p-1.5 rounded-lg transition-colors" style={{ color: 'var(--text-3)' }}>
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              {/* Name + Model */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-caption block" style={{ color: 'var(--text-3)' }}>Nom</label>
                  <input value={name} onChange={(e) => setName(e.target.value)}
                    placeholder="Mon Agent" className="w-full rounded-xl px-4 py-3 text-sm border outline-none"
                    style={{ background: 'var(--bg-4)', borderColor: 'var(--border-1)', color: 'var(--text-0)', fontSize: '14px' }} />
                </div>
                <div className="space-y-2">
                  <label className="text-caption block" style={{ color: 'var(--text-3)' }}>Modèle</label>
                  <div className="relative">
                    <select value={model} onChange={(e) => setModel(e.target.value as ClaudeModel)}
                      className="w-full rounded-xl px-4 py-3 text-sm border outline-none appearance-none cursor-pointer"
                      style={{ background: 'var(--bg-4)', borderColor: 'var(--border-1)', color: 'var(--text-0)', fontSize: '14px' }}>
                      {MODELS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"
                      style={{ color: 'var(--text-3)' }} />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-caption block" style={{ color: 'var(--text-3)' }}>Description</label>
                <input value={description} onChange={(e) => setDescription(e.target.value)}
                  placeholder="Description courte de l'agent"
                  className="w-full rounded-xl px-4 py-3 text-sm border outline-none"
                  style={{ background: 'var(--bg-4)', borderColor: 'var(--border-1)', color: 'var(--text-0)', fontSize: '14px' }} />
              </div>

              {/* System prompt */}
              <div className="space-y-2">
                <label className="text-caption block" style={{ color: 'var(--text-3)' }}>System Prompt</label>
                <textarea value={systemPrompt} onChange={(e) => setSystemPrompt(e.target.value)}
                  placeholder="Instructions pour le comportement de l'agent..."
                  rows={5}
                  className="w-full rounded-xl px-4 py-3 text-sm border outline-none resize-y mono"
                  style={{ background: 'var(--bg-4)', borderColor: 'var(--border-1)', color: 'var(--text-0)', fontSize: '14px' }} />
              </div>

              {/* CLAUDE.md template */}
              <div className="space-y-2">
                <label className="text-caption block" style={{ color: 'var(--text-3)' }}>Template CLAUDE.md</label>
                <textarea value={claudeMdTemplate} onChange={(e) => setClaudeMdTemplate(e.target.value)}
                  placeholder="# Project Guidelines\n\n## Code Style\n..."
                  rows={5}
                  className="w-full rounded-xl px-4 py-3 text-sm border outline-none resize-y mono"
                  style={{ background: 'var(--bg-4)', borderColor: 'var(--border-1)', color: 'var(--text-0)', fontSize: '14px' }} />
              </div>

              {/* Parameters */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-caption block" style={{ color: 'var(--text-3)' }}>
                    Max Tokens: <span className="mono">{maxTokens.toLocaleString()}</span>
                  </label>
                  <input type="range" min={1024} max={65536} step={1024} value={maxTokens}
                    onChange={(e) => setMaxTokens(Number(e.target.value))}
                    className="w-full accent-[var(--cyan)]" />
                </div>
                <div className="space-y-2">
                  <label className="text-caption block" style={{ color: 'var(--text-3)' }}>
                    Temperature: <span className="mono">{temperature.toFixed(1)}</span>
                  </label>
                  <input type="range" min={0} max={1} step={0.1} value={temperature}
                    onChange={(e) => setTemperature(Number(e.target.value))}
                    className="w-full accent-[var(--cyan)]" />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t shrink-0"
              style={{ borderColor: 'var(--border-0)' }}>
              <div>
                {isEditing && (
                  <button onClick={handleDelete}
                    className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm transition-colors"
                    style={{ color: 'var(--red)' }}>
                    <Trash2 size={14} /> Supprimer
                  </button>
                )}
              </div>
              <div className="flex gap-3">
                <button onClick={onClose} className="btn-ghost rounded-xl px-4 py-2.5 text-sm"
                  style={{ color: 'var(--text-2)' }}>Annuler</button>
                <button onClick={handleSave} disabled={!name.trim()}
                  className="btn-primary flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium disabled:opacity-40">
                  <Save size={14} /> {isEditing ? 'Sauvegarder' : 'Créer l\'agent'}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
