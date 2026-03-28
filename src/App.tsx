import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AppShell } from './components/layout/AppShell';
import { OnboardingPage } from './components/onboarding/OnboardingPage';
import { useKeyboard } from './hooks/useKeyboard';
import { useAuthStore } from './stores/authStore';

const pageTransition = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

export function App() {
  useKeyboard();

  const { status, checkExistingKey } = useAuthStore();

  useEffect(() => {
    checkExistingKey();
  }, [checkExistingKey]);

  const isAuthenticated = status === 'valid';
  const isLoading = status === 'unchecked';

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center h-screen w-screen"
        style={{ background: 'var(--bg-0)' }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-body"
          style={{ color: 'var(--text-3)' }}
        >
          Loading...
        </motion.div>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {isAuthenticated ? (
        <motion.div
          key="app"
          variants={pageTransition}
          initial="initial"
          animate="animate"
          exit="exit"
          className="h-screen w-screen"
        >
          <AppShell />
        </motion.div>
      ) : (
        <motion.div
          key="onboarding"
          variants={pageTransition}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          <OnboardingPage />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
