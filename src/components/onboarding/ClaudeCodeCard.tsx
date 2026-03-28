import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Terminal, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { detectClaudeCode } from '@/lib/tauri';

interface ClaudeCodeCardProps {
  onDetected: (detected: boolean) => void;
  onContinue: () => void;
}

type DetectionStatus = 'checking' | 'found' | 'not_found';

export function ClaudeCodeCard({ onDetected, onContinue }: ClaudeCodeCardProps) {
  const [status, setStatus] = useState<DetectionStatus>('checking');

  useEffect(() => {
    let cancelled = false;

    async function detect() {
      try {
        const found = await detectClaudeCode();
        if (!cancelled) {
          setStatus(found ? 'found' : 'not_found');
          onDetected(found);
        }
      } catch {
        if (!cancelled) {
          setStatus('not_found');
          onDetected(false);
        }
      }
    }

    detect();
    return () => { cancelled = true; };
  }, [onDetected]);

  const statusContent = {
    checking: {
      icon: <Loader2 size={16} className="animate-spin" style={{ color: 'var(--cyan)' }} />,
      text: 'Detecting Claude Code CLI...',
      color: 'var(--text-2)',
    },
    found: {
      icon: <CheckCircle2 size={16} style={{ color: 'var(--green)' }} />,
      text: 'Claude Code CLI detected',
      color: 'var(--green)',
    },
    not_found: {
      icon: <XCircle size={16} style={{ color: 'var(--text-3)' }} />,
      text: 'Claude Code CLI not found',
      color: 'var(--text-3)',
    },
  } as const;

  const current = statusContent[status];

  return (
    <motion.div
      className="card card-glow-green p-6"
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div
          className="flex items-center justify-center w-10 h-10 rounded-xl"
          style={{ background: 'var(--green-glow)', border: '1px solid rgba(0, 255, 136, 0.15)' }}
        >
          <Terminal size={20} style={{ color: 'var(--green)' }} />
        </div>
        <div>
          <h3 className="text-h3" style={{ color: 'var(--text-0)' }}>Use Local Claude Code</h3>
          <p className="text-small" style={{ color: 'var(--text-3)' }}>
            Detect installed Claude Code CLI
          </p>
        </div>
      </div>

      <div
        className="flex items-center gap-2 px-4 py-3 rounded-xl mb-4 text-small"
        style={{ background: 'var(--bg-3)', border: '1px solid var(--border-1)' }}
      >
        {current.icon}
        <span style={{ color: current.color }}>{current.text}</span>
      </div>

      {status === 'found' && (
        <motion.button
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={onContinue}
          className="btn-primary w-full py-3 rounded-xl text-body font-semibold"
          style={{ borderRadius: 'var(--r-xl)' }}
        >
          Continue with Claude Code
        </motion.button>
      )}

      {status === 'not_found' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-small px-1"
          style={{ color: 'var(--text-3)' }}
        >
          Install Claude Code CLI to use this option.
          <br />
          <code className="mono" style={{ color: 'var(--text-2)' }}>
            npm install -g @anthropic-ai/claude-code
          </code>
        </motion.div>
      )}
    </motion.div>
  );
}
