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
            className="fixed top-1/2 left-1/2 z-50 w-full max-w-2xl max-h-[85vh] rounded-xl border overflow-hidden flex flex-col"
            style={{
              background: 'var(--bg-elevated)', borderColor: 'var(--border-default)',
              transform: 'translate(-50%, -50%)',
            }}
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b shrink-0"
              style={{ borderColor: 'var(--border-subtle)' }}>
              <h2 className="text-h3" style={{ color: 'var(--text-primary)' }}>
                {isEditing ? `Éditer ${agent.name}` : 'Nouvel agent'}
              </h2>
              <button onClick={onClose} style={{ color: 'var(--text-tertiary)' }}><X size={18} /></button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {/* Name + Description */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-caption" style={{ color: 'var(--text-tertiary)' }}>Nom</label>
                  <input value={name} onChange={(e) => setName(e.target.value)}
                    placeholder="Mon Agent" className="w-full rounded-lg px-3 py-2 text-sm bg-transparent border outline-none"
                    style={{ borderColor: 'var(--border-default)', color: 'var(--text-primary)' }} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-caption" style={{ color: 'var(--text-tertiary)' }}>Modèle</label>
                  <div className="relative">
                    <select value={model} onChange={(e) => setModel(e.target.value as ClaudeModel)}
                      className="w-full rounded-lg px-3 py-2 text-sm border outline-none appearance-none cursor-pointer"
                      style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}>
                      {MODELS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                      style={{ color: 'var(--text-tertiary)' }} />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-caption" style={{ color: 'var(--text-tertiary)' }}>Description</label>
                <input value={description} onChange={(e) => setDescription(e.target.value)}
                  placeholder="Description courte de l'agent"
                  className="w-full rounded-lg px-3 py-2 text-sm bg-transparent border outline-none"
                  style={{ borderColor: 'var(--border-default)', color: 'var(--text-primary)' }} />
              </div>

              {/* System prompt */}
              <div className="space-y-1.5">
                <label className="text-caption" style={{ color: 'var(--text-tertiary)' }}>System Prompt</label>
                <textarea value={systemPrompt} onChange={(e) => setSystemPrompt(e.target.value)}
                  placeholder="Instructions pour le comportement de l'agent..."
                  rows={5}
                  className="w-full rounded-lg px-3 py-2 text-sm bg-transparent border outline-none resize-y mono"
                  style={{ borderColor: 'var(--border-default)', color: 'var(--text-primary)' }} />
              </div>

              {/* CLAUDE.md template */}
              <div className="space-y-1.5">
                <label className="text-caption" style={{ color: 'var(--text-tertiary)' }}>Template CLAUDE.md</label>
                <textarea value={claudeMdTemplate} onChange={(e) => setClaudeMdTemplate(e.target.value)}
                  placeholder="# Project Guidelines\n\n## Code Style\n..."
                  rows={5}
                  className="w-full rounded-lg px-3 py-2 text-sm bg-transparent border outline-none resize-y mono"
                  style={{ borderColor: 'var(--border-default)', color: 'var(--text-primary)' }} />
              </div>

              {/* Parameters */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-caption" style={{ color: 'var(--text-tertiary)' }}>
                    Max Tokens: <span className="mono">{maxTokens.toLocaleString()}</span>
                  </label>
                  <input type="range" min={1024} max={65536} step={1024} value={maxTokens}
                    onChange={(e) => setMaxTokens(Number(e.target.value))}
                    className="w-full accent-[var(--accent-primary)]" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-caption" style={{ color: 'var(--text-tertiary)' }}>
                    Temperature: <span className="mono">{temperature.toFixed(1)}</span>
                  </label>
                  <input type="range" min={0} max={1} step={0.1} value={temperature}
                    onChange={(e) => setTemperature(Number(e.target.value))}
                    className="w-full accent-[var(--accent-primary)]" />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-5 py-4 border-t shrink-0"
              style={{ borderColor: 'var(--border-subtle)' }}>
              <div>
                {isEditing && (
                  <button onClick={handleDelete}
                    className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm"
                    style={{ color: 'var(--accent-error)' }}>
                    <Trash2 size={14} /> Supprimer
                  </button>
                )}
              </div>
              <div className="flex gap-3">
                <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm"
                  style={{ color: 'var(--text-secondary)' }}>Annuler</button>
                <button onClick={handleSave} disabled={!name.trim()}
                  className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-40"
                  style={{ background: 'var(--accent-primary)', color: 'white' }}>
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
