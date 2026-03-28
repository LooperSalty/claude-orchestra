import { motion } from 'framer-motion';
import { Bot, User } from 'lucide-react';

interface ChatMessageProps {
  content: string;
  type: 'user' | 'assistant' | 'system';
  timestamp?: string;
}

const messageVariants = {
  initial: { opacity: 0, y: 12, scale: 0.97 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] as const },
  },
};

function formatTime(iso?: string): string {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

export function ChatMessage({ content, type, timestamp }: ChatMessageProps) {
  if (type === 'system') {
    return (
      <motion.div
        variants={messageVariants}
        initial="initial"
        animate="animate"
        className="flex justify-center"
        style={{ padding: '8px 16px' }}
      >
        <span
          className="text-xs font-mono"
          style={{
            color: 'var(--text-4)',
            background: 'rgba(255, 255, 255, 0.03)',
            padding: '4px 12px',
            borderRadius: '8px',
            border: '1px solid var(--border-0)',
          }}
        >
          {content}
        </span>
      </motion.div>
    );
  }

  if (type === 'user') {
    return (
      <motion.div
        variants={messageVariants}
        initial="initial"
        animate="animate"
        className="flex justify-end"
        style={{ padding: '4px 16px' }}
      >
        <div className="flex items-end gap-2" style={{ maxWidth: '80%' }}>
          <div>
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.15), rgba(139, 92, 246, 0.15))',
                border: '1px solid rgba(0, 212, 255, 0.2)',
                borderRadius: '16px 16px 4px 16px',
                padding: '10px 16px',
              }}
            >
              <p
                className="text-sm leading-relaxed whitespace-pre-wrap"
                style={{ color: 'var(--text-0)' }}
              >
                {content}
              </p>
            </div>
            {timestamp && (
              <p
                className="text-right mt-1"
                style={{ color: 'var(--text-4)', fontSize: '10px' }}
              >
                {formatTime(timestamp)}
              </p>
            )}
          </div>
          <div
            className="shrink-0 flex items-center justify-center rounded-full"
            style={{
              width: '28px',
              height: '28px',
              background: 'linear-gradient(135deg, var(--cyan), var(--violet))',
            }}
          >
            <User size={14} color="#000" strokeWidth={2.5} />
          </div>
        </div>
      </motion.div>
    );
  }

  // Assistant message
  return (
    <motion.div
      variants={messageVariants}
      initial="initial"
      animate="animate"
      className="flex justify-start"
      style={{ padding: '4px 16px' }}
    >
      <div className="flex items-end gap-2" style={{ maxWidth: '85%' }}>
        <div
          className="shrink-0 flex items-center justify-center rounded-full"
          style={{
            width: '28px',
            height: '28px',
            background: 'var(--bg-4)',
            border: '1px solid var(--border-1)',
          }}
        >
          <Bot size={14} style={{ color: 'var(--green)' }} strokeWidth={2.5} />
        </div>
        <div>
          <div
            style={{
              background: 'var(--bg-3)',
              border: '1px solid var(--border-1)',
              borderRadius: '16px 16px 16px 4px',
              padding: '12px 16px',
            }}
          >
            <p
              className="text-sm leading-relaxed whitespace-pre-wrap"
              style={{ color: 'var(--text-1)' }}
            >
              {content}
            </p>
          </div>
          {timestamp && (
            <p
              className="mt-1"
              style={{ color: 'var(--text-4)', fontSize: '10px' }}
            >
              {formatTime(timestamp)}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
