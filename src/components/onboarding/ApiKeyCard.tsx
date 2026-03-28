import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Key, Loader2, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';

interface ApiKeyCardProps {
  onValidate: (key: string) => Promise<boolean>;
  isValidating: boolean;
  error: string | null;
  isValid: boolean;
}

export function ApiKeyCard({ onValidate, isValidating, error, isValid }: ApiKeyCardProps) {
  const [key, setKey] = useState('');
  const [showKey, setShowKey] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (key.trim().length > 0 && !isValidating) {
      onValidate(key.trim());
    }
  };

  return (
    <motion.div
      className="card card-glow-cyan p-6 cursor-pointer"
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div
          className="flex items-center justify-center w-10 h-10 rounded-xl"
          style={{ background: 'var(--cyan-glow)', border: '1px solid rgba(0, 212, 255, 0.15)' }}
        >
          <Key size={20} style={{ color: 'var(--cyan)' }} />
        </div>
        <div>
          <h3 className="text-h3" style={{ color: 'var(--text-0)' }}>Connect with API Key</h3>
          <p className="text-small" style={{ color: 'var(--text-3)' }}>
            Use your Anthropic API key
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <input
            type={showKey ? 'text' : 'password'}
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="sk-ant-api03-..."
            disabled={isValidating || isValid}
            className="w-full px-4 py-3 pr-10 rounded-xl text-body mono"
            style={{
              background: 'var(--bg-3)',
              border: '1px solid var(--border-1)',
              color: 'var(--text-0)',
              outline: 'none',
              transition: 'border-color 200ms, box-shadow 200ms',
            }}
          />
          <button
            type="button"
            onClick={() => setShowKey((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--text-3)', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-2 text-small"
              style={{ color: 'var(--red)' }}
            >
              <AlertCircle size={14} />
              <span>{error}</span>
            </motion.div>
          )}
          {isValid && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-2 text-small"
              style={{ color: 'var(--green)' }}
            >
              <CheckCircle2 size={14} />
              <span>API key validated successfully</span>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          type="submit"
          disabled={key.trim().length === 0 || isValidating || isValid}
          className="btn-primary w-full py-3 rounded-xl text-body font-semibold flex items-center justify-center gap-2"
          style={{
            opacity: key.trim().length === 0 || isValid ? 0.5 : 1,
            borderRadius: 'var(--r-xl)',
          }}
        >
          {isValidating ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Validating...
            </>
          ) : isValid ? (
            <>
              <CheckCircle2 size={16} />
              Connected
            </>
          ) : (
            'Validate & Connect'
          )}
        </button>
      </form>
    </motion.div>
  );
}
