import { useCallback } from 'react';
import { motion } from 'framer-motion';
import { Music } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { ApiKeyCard } from './ApiKeyCard';
import { ClaudeCodeCard } from './ClaudeCodeCard';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export function OnboardingPage() {
  const { status, error, validateAndSave, setStatus, setClaudeCodeDetected } = useAuthStore();

  const handleValidate = useCallback(
    async (key: string): Promise<boolean> => {
      return validateAndSave(key);
    },
    [validateAndSave],
  );

  const handleClaudeCodeDetected = useCallback(
    (detected: boolean) => {
      setClaudeCodeDetected(detected);
    },
    [setClaudeCodeDetected],
  );

  const handleClaudeCodeContinue = useCallback(() => {
    setStatus('valid');
  }, [setStatus]);

  return (
    <div
      className="flex items-center justify-center h-screen w-screen overflow-hidden noise"
      style={{ background: 'var(--bg-0)' }}
    >
      {/* Background dot pattern */}
      <div className="dot-pattern absolute inset-0 pointer-events-none" />

      {/* Ambient glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: '600px',
          height: '600px',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle, rgba(0, 212, 255, 0.04) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />

      <motion.div
        className="relative z-10 flex flex-col items-center w-full max-w-lg px-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Logo */}
        <motion.div variants={itemVariants} className="flex flex-col items-center mb-10">
          <motion.div
            className="flex items-center justify-center w-20 h-20 rounded-2xl mb-6"
            style={{
              background: 'var(--gradient-primary)',
              boxShadow: '0 0 40px rgba(0, 212, 255, 0.2), 0 0 80px rgba(139, 92, 246, 0.1)',
            }}
            animate={{
              boxShadow: [
                '0 0 40px rgba(0, 212, 255, 0.2), 0 0 80px rgba(139, 92, 246, 0.1)',
                '0 0 60px rgba(0, 212, 255, 0.3), 0 0 100px rgba(139, 92, 246, 0.15)',
                '0 0 40px rgba(0, 212, 255, 0.2), 0 0 80px rgba(139, 92, 246, 0.1)',
              ],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Music size={36} color="#000" strokeWidth={2.5} />
          </motion.div>

          <h1
            className="text-display font-display text-center mb-3"
            style={{ color: 'var(--text-0)' }}
          >
            Claude Orchestra
          </h1>
          <p className="text-body text-center max-w-sm" style={{ color: 'var(--text-2)' }}>
            Manage multiple Claude Code instances from a single dashboard.
            Connect your API key or use the local CLI to get started.
          </p>
        </motion.div>

        {/* Cards */}
        <motion.div variants={itemVariants} className="w-full space-y-4">
          <ApiKeyCard
            onValidate={handleValidate}
            isValidating={status === 'validating'}
            error={error}
            isValid={status === 'valid'}
          />
          <ClaudeCodeCard
            onDetected={handleClaudeCodeDetected}
            onContinue={handleClaudeCodeContinue}
          />
        </motion.div>

        {/* Footer */}
        <motion.p
          variants={itemVariants}
          className="text-small mt-8 text-center"
          style={{ color: 'var(--text-4)' }}
        >
          Your API key is stored locally and never shared.
        </motion.p>
      </motion.div>
    </div>
  );
}
