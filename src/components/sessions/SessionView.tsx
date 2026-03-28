import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  MessageSquare,
  TerminalSquare,
  Send,
  Cpu,
  Coins,
} from 'lucide-react';
import type { Session } from '@/types/session';
import { useChatStore } from '@/stores/chatStore';
import { useSession } from '@/hooks/useSession';
import { Terminal } from '../shared/Terminal';
import { ChatMessage } from './ChatMessage';

interface SessionViewProps {
  session: Session;
  onClose: () => void;
}

type ViewTab = 'chat' | 'terminal';

const STATUS_LABELS: Record<string, string> = {
  running: 'En cours',
  stopped: 'Arrêté',
  error: 'Erreur',
  paused: 'Pause',
};

const STATUS_COLORS: Record<string, string> = {
  running: 'var(--green)',
  stopped: 'var(--text-4)',
  error: 'var(--red)',
  paused: 'var(--amber)',
};

export function SessionView({ session, onClose }: SessionViewProps) {
  const [activeTab, setActiveTab] = useState<ViewTab>('chat');
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const messages = useChatStore((s) => s.getMessages(session.id));
  const addMessage = useChatStore((s) => s.addMessage);
  const appendToAssistant = useChatStore((s) => s.appendToAssistant);
  const flushAssistant = useChatStore((s) => s.flushAssistant);
  const { sendToSession } = useSession();

  // Listen to PTY output for chat messages
  useEffect(() => {
    const eventName = `session-output-${session.id}`;
    let flushTimer: ReturnType<typeof setTimeout> | null = null;

    function handleOutput(e: Event) {
      const detail = (e as CustomEvent).detail as {
        content: string;
        log_type: string;
      } | undefined;
      if (!detail?.content) return;

      appendToAssistant(session.id, detail.content);

      // Debounce flush: after 500ms of no output, finalize the message
      if (flushTimer) clearTimeout(flushTimer);
      flushTimer = setTimeout(() => {
        flushAssistant(session.id);
      }, 500);
    }

    window.addEventListener(eventName, handleOutput);
    return () => {
      window.removeEventListener(eventName, handleOutput);
      if (flushTimer) clearTimeout(flushTimer);
    };
  }, [session.id, appendToAssistant, flushAssistant]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = useCallback(() => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    addMessage(session.id, {
      sessionId: session.id,
      type: 'user',
      content: trimmed,
    });

    sendToSession(session.id, trimmed + '\n');
    setInputValue('');

    // Refocus input
    requestAnimationFrame(() => inputRef.current?.focus());
  }, [inputValue, session.id, addMessage, sendToSession]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  // Terminal input handler
  const handleTerminalData = useCallback(
    async (data: string) => {
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        await invoke('send_input', { sessionId: session.id, message: data });
      } catch {
        // Browser mode
      }
    },
    [session.id],
  );

  const statusColor = STATUS_COLORS[session.status] ?? 'var(--text-4)';
  const statusLabel = STATUS_LABELS[session.status] ?? session.status;
  const modelLabel = session.model.replace('claude-', '');

  return (
    <div
      className="flex flex-col rounded-xl border overflow-hidden h-full"
      style={{
        background: 'var(--bg-2)',
        borderColor:
          session.status === 'running'
            ? 'rgba(0, 255, 136, 0.2)'
            : 'var(--border-0)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between shrink-0 border-b"
        style={{
          padding: '10px 16px',
          borderColor: 'var(--border-0)',
          background: 'var(--bg-3)',
        }}
      >
        <div className="flex items-center" style={{ gap: '12px' }}>
          {/* Session ID */}
          <span
            className="font-mono text-xs"
            style={{ color: 'var(--text-2)' }}
          >
            {session.id.slice(0, 8)}
          </span>

          {/* Model pill */}
          <span
            className="text-xs font-semibold rounded-full"
            style={{
              padding: '2px 10px',
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(0, 212, 255, 0.15))',
              border: '1px solid rgba(139, 92, 246, 0.25)',
              color: 'var(--violet)',
            }}
          >
            <Cpu size={10} className="inline mr-1" style={{ marginTop: '-1px' }} />
            {modelLabel}
          </span>

          {/* Status */}
          <div className="flex items-center" style={{ gap: '6px' }}>
            <span
              className={`w-2 h-2 rounded-full ${session.status === 'running' ? 'status-live' : ''}`}
              style={{ background: statusColor }}
            />
            <span className="text-xs" style={{ color: statusColor }}>
              {statusLabel}
            </span>
          </div>

          {/* Token counter */}
          {session.totalTokensUsed > 0 && (
            <span
              className="flex items-center text-xs"
              style={{ gap: '4px', color: 'var(--text-4)' }}
            >
              <Coins size={11} />
              {session.totalTokensUsed.toLocaleString()}
            </span>
          )}
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg transition-colors hover:bg-[var(--bg-hover)]"
          style={{
            color: 'var(--text-3)',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <X size={16} />
        </button>
      </div>

      {/* Tab toggle */}
      <div
        className="flex shrink-0 border-b"
        style={{
          padding: '0 16px',
          borderColor: 'var(--border-0)',
          background: 'var(--bg-2)',
        }}
      >
        {(
          [
            { key: 'chat' as const, label: 'Chat', icon: MessageSquare },
            { key: 'terminal' as const, label: 'Terminal', icon: TerminalSquare },
          ] as const
        ).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className="relative flex items-center text-sm transition-colors"
            style={{
              gap: '6px',
              padding: '10px 16px',
              color: activeTab === key ? 'var(--text-0)' : 'var(--text-4)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <Icon size={14} />
            {label}
            {activeTab === key && (
              <motion.div
                layoutId={`tab-indicator-${session.id}`}
                className="absolute bottom-0 left-0 right-0"
                style={{
                  height: '2px',
                  background: 'var(--cyan)',
                  borderRadius: '2px 2px 0 0',
                }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Content area */}
      <div className="flex-1 min-h-0 relative">
        <AnimatePresence mode="wait">
          {activeTab === 'chat' ? (
            <motion.div
              key="chat"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
              className="absolute inset-0 flex flex-col"
            >
              {/* Messages */}
              <div
                className="flex-1 overflow-y-auto"
                style={{ paddingTop: '16px', paddingBottom: '8px' }}
              >
                {messages.length === 0 ? (
                  <div
                    className="flex flex-col items-center justify-center h-full"
                    style={{ gap: '12px' }}
                  >
                    <MessageSquare
                      size={32}
                      style={{ color: 'var(--text-4)', opacity: 0.4 }}
                    />
                    <p
                      className="text-sm"
                      style={{ color: 'var(--text-4)' }}
                    >
                      La conversation apparaitra ici...
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col" style={{ gap: '8px' }}>
                    {messages.map((msg) => (
                      <ChatMessage
                        key={msg.id}
                        content={msg.content}
                        type={msg.type}
                        timestamp={msg.timestamp}
                      />
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Input bar */}
              <div
                className="shrink-0 border-t"
                style={{
                  padding: '12px 16px',
                  borderColor: 'var(--border-0)',
                  background: 'rgba(10, 10, 11, 0.8)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                }}
              >
                <div
                  className="flex items-end rounded-xl border"
                  style={{
                    background: 'var(--bg-3)',
                    borderColor: 'var(--border-1)',
                    padding: '4px',
                  }}
                >
                  <textarea
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Envoyer un message à Claude..."
                    rows={1}
                    className="flex-1 resize-none text-sm"
                    style={{
                      padding: '10px 12px',
                      background: 'transparent',
                      border: 'none',
                      outline: 'none',
                      color: 'var(--text-0)',
                      lineHeight: '1.5',
                      maxHeight: '120px',
                      fontFamily: 'inherit',
                    }}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!inputValue.trim()}
                    className="shrink-0 flex items-center justify-center rounded-lg transition-all"
                    style={{
                      width: '36px',
                      height: '36px',
                      background: inputValue.trim()
                        ? 'linear-gradient(135deg, var(--cyan), var(--violet))'
                        : 'var(--bg-4)',
                      border: 'none',
                      cursor: inputValue.trim() ? 'pointer' : 'default',
                      opacity: inputValue.trim() ? 1 : 0.4,
                    }}
                  >
                    <Send
                      size={16}
                      color={inputValue.trim() ? '#000' : 'var(--text-4)'}
                      strokeWidth={2.5}
                    />
                  </button>
                </div>
                <p
                  className="text-center mt-1.5"
                  style={{ color: 'var(--text-4)', fontSize: '10px' }}
                >
                  Entrée pour envoyer · Shift+Entrée pour un saut de ligne
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="terminal"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.15 }}
              className="absolute inset-0 p-1"
            >
              <Terminal
                sessionId={session.id}
                onData={handleTerminalData}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
