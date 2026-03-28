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

const pageVariants = {
  initial: { opacity: 0, y: 12, filter: 'blur(6px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] as const } },
  exit: { opacity: 0, y: -8, filter: 'blur(4px)', transition: { duration: 0.15 } },
};

export function AppShell() {
  const { currentPage, commandPaletteOpen, sidebarCollapsed } = useUIStore();
  const PageComponent = PAGE_COMPONENTS[currentPage];

  return (
    <div className="flex h-screen w-screen overflow-hidden" style={{ background: 'var(--bg-void)' }}>
      <Sidebar />
      <div className="flex flex-1 flex-col min-w-0">
        <TopBar />
        <main
          className="flex-1 overflow-auto relative"
          style={{
            background: 'var(--bg-deep)',
            marginLeft: sidebarCollapsed ? 0 : undefined,
          }}
        >
          <div className="dot-grid absolute inset-0 pointer-events-none opacity-30" />
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="relative z-10 h-full p-6"
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
