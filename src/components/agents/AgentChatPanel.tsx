import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Send } from 'lucide-react';
import { useAgentWorldStore } from '@/stores/agentWorldStore';
import { useAgentStore } from '@/stores/agentStore';
import type { AgentVisualState } from '@/types/agentWorld';

const STATE_LABELS: Record<AgentVisualState, string> = {
  idle: 'Au repos',
  walking: 'En mouvement',
  working: 'En travail',
  thinking: 'En reflexion',
  talking: 'En conversation',
  error: 'Erreur',
  sleeping: 'Endormi',
};

export function AgentChatPanel() {
  const selectedAgent = useAgentWorldStore((s) => s.selectedAgent);
  const agents = useAgentWorldStore((s) => s.agents);
  const chatMessages = useAgentWorldStore((s) => s.chatMessages);
  const selectAgent = useAgentWorldStore((s) => s.selectAgent);
  const sendMessage = useAgentWorldStore((s) => s.sendMessage);
  const configAgents = useAgentStore((s) => s.agents);

  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const sprite = agents.find((a) => a.id === selectedAgent);
  const config = configAgents.find((a) => a.id === selectedAgent);
  const messages = selectedAgent ? chatMessages[selectedAgent] ?? [] : [];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length]);

  if (!selectedAgent || !sprite) return null;

  function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || !selectedAgent) return;
    sendMessage(selectedAgent, trimmed);
    setInput('');
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <motion.div
      initial={{ x: 320, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 320, opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="absolute right-0 top-0 bottom-0 flex flex-col"
      style={{
        width: 320,
        background: 'rgba(17, 17, 19, 0.85)',
        backdropFilter: 'blur(24px) saturate(1.2)',
        borderLeft: '1px solid rgba(255, 255, 255, 0.07)',
        zIndex: 20,
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-3"
        style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.07)' }}
      >
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center text-base"
          style={{ background: sprite.color + '20', color: sprite.color }}
        >
          {sprite.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold truncate" style={{ color: 'var(--text-0)' }}>
            {sprite.name}
          </div>
          <div className="text-small flex items-center gap-1.5" style={{ color: 'var(--text-3)' }}>
            <span
              className="w-1.5 h-1.5 rounded-full inline-block"
              style={{ background: sprite.state === 'error' ? 'var(--red)' : 'var(--green)' }}
            />
            {STATE_LABELS[sprite.state]}
            {config && (
              <span className="ml-1 mono" style={{ color: 'var(--text-4)' }}>
                {config.model.replace('claude-', '')}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={() => selectAgent(null)}
          className="p-1.5 rounded-lg transition-colors"
          style={{ color: 'var(--text-3)' }}
        >
          <X size={16} />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.length === 0 && (
          <div className="text-small text-center py-8" style={{ color: 'var(--text-4)' }}>
            Envoyez un message pour discuter avec {sprite.name}
          </div>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
            <div
              className="max-w-[85%] rounded-xl px-3 py-2 text-small"
              style={{
                background: msg.isUser ? 'rgba(0, 212, 255, 0.12)' : 'rgba(255, 255, 255, 0.05)',
                color: msg.isUser ? 'var(--cyan)' : 'var(--text-1)',
                borderBottomRightRadius: msg.isUser ? 4 : undefined,
                borderBottomLeftRadius: msg.isUser ? undefined : 4,
              }}
            >
              {msg.content}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div
        className="px-3 py-3 flex items-center gap-2"
        style={{ borderTop: '1px solid rgba(255, 255, 255, 0.07)' }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Tapez un message..."
          className="flex-1 rounded-lg px-3 py-2 text-small"
          style={{
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.07)',
            color: 'var(--text-1)',
            outline: 'none',
          }}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim()}
          className="p-2 rounded-lg transition-colors"
          style={{
            background: input.trim() ? 'var(--cyan)' : 'rgba(255,255,255,0.04)',
            color: input.trim() ? '#000' : 'var(--text-4)',
          }}
        >
          <Send size={14} />
        </button>
      </div>
    </motion.div>
  );
}
