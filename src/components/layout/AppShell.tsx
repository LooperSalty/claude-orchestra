import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { StatusBar } from './StatusBar';
import { CommandPalette } from './CommandPalette';
import { useUIStore } from '@/stores/uiStore';
import { DashboardPage } from '../metrics/DashboardPage';
import { SessionsPage } from '../sessions/SessionsPage';
import { AgentsPage } from '../agents/AgentsPage';
import { MemoryPage } from '../memory/MemoryPage';
import { SkillsPage } from '../skills/SkillsPage';
import { PluginsPage } from '../plugins/PluginsPage';
import { MetricsPage } from '../metrics/MetricsPage';
import { ConfigPage } from '../config/ConfigPage';
import { AnimatePresence, motion } from 'framer-motion';

const PAGE_COMPONENTS = {
  dashboard: DashboardPage,
  sessions: SessionsPage,
  agents: AgentsPage,
  memory: MemoryPage,
  skills: SkillsPage,
  plugins: PluginsPage,
  metrics: MetricsPage,
  config: ConfigPage,
} as const;

const pageTransition = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] as const } },
  exit: { opacity: 0, y: -4, transition: { duration: 0.12 } },
};

export function AppShell() {
  const { currentPage, commandPaletteOpen } = useUIStore();
  const PageComponent = PAGE_COMPONENTS[currentPage];

  return (
    <div className="flex h-screen w-screen overflow-hidden" style={{ background: 'var(--bg-0)' }}>
      <Sidebar />
      <div className="flex flex-1 flex-col min-w-0">
        <TopBar />
        <main className="flex-1 overflow-auto relative" style={{ background: 'var(--bg-1)' }}>
          <div className="dot-pattern absolute inset-0 pointer-events-none" />
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              variants={pageTransition}
              initial="initial"
              animate="animate"
              exit="exit"
              className="relative z-10 h-full p-8"
            >
              <PageComponent />
            </motion.div>
          </AnimatePresence>
        </main>
        <StatusBar />
      </div>
      <AnimatePresence>
        {commandPaletteOpen && <CommandPalette />}
      </AnimatePresence>
    </div>
  );
}
