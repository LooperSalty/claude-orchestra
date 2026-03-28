import { motion } from 'framer-motion';
import {
  LayoutDashboard, Terminal, Bot, Brain, Sparkles,
  Plug, BarChart3, Settings, ChevronLeft, ChevronRight,
  Plus, Square,
} from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';
import { useSessionStore } from '@/stores/sessionStore';
import type { NavigationPage } from '@/types/config';

const ICONS: Record<string, React.ElementType> = {
  LayoutDashboard, Terminal, Bot, Brain,
  Sparkles, Plug, BarChart3, Settings,
};

const NAV_ITEMS: { id: NavigationPage; label: string; icon: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { id: 'sessions', label: 'Sessions', icon: 'Terminal' },
  { id: 'agents', label: 'Agents', icon: 'Bot' },
  { id: 'memory', label: 'Memory', icon: 'Brain' },
  { id: 'skills', label: 'Skills', icon: 'Sparkles' },
  { id: 'plugins', label: 'Plugins', icon: 'Plug' },
  { id: 'metrics', label: 'Metrics', icon: 'BarChart3' },
  { id: 'config', label: 'Config', icon: 'Settings' },
];

export function Sidebar() {
  const { currentPage, setPage, sidebarCollapsed, toggleSidebar } = useUIStore();
  const activeSessions = useSessionStore((s) =>
    s.sessions.filter((sess) => sess.status === 'running').length
  );

  return (
    <motion.aside
      className="flex flex-col h-full border-r relative z-20"
      style={{
        background: 'var(--bg-surface)',
        borderColor: 'var(--border-subtle)',
        width: sidebarCollapsed ? 56 : 220,
      }}
      animate={{ width: sidebarCollapsed ? 56 : 220 }}
      transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-2 px-4 h-12 border-b shrink-0"
        style={{ borderColor: 'var(--border-subtle)' }}
      >
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
          style={{
            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-purple))',
            color: 'white',
          }}
        >
          CO
        </div>
        {!sidebarCollapsed && (
          <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            Orchestra
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-2 px-2 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = ICONS[item.icon];
          const isActive = currentPage === item.id;
          const badge = item.id === 'sessions' && activeSessions > 0 ? activeSessions : null;

          return (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              className="flex items-center gap-2.5 w-full rounded-lg px-3 py-2 text-sm transition-colors duration-150"
              style={{
                background: isActive ? 'var(--accent-primary-glow)' : 'transparent',
                color: isActive ? 'var(--accent-primary-hover)' : 'var(--text-secondary)',
                borderLeft: isActive ? '2px solid var(--accent-primary)' : '2px solid transparent',
              }}
            >
              <Icon size={18} />
              {!sidebarCollapsed && (
                <>
                  <span className="flex-1 text-left">{item.label}</span>
                  {badge !== null && (
                    <span
                      className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                      style={{
                        background: 'var(--accent-success-glow)',
                        color: 'var(--accent-success)',
                      }}
                    >
                      {badge}
                    </span>
                  )}
                </>
              )}
            </button>
          );
        })}
      </nav>

      {/* Quick Actions */}
      {!sidebarCollapsed && (
        <div className="px-3 pb-2 space-y-1">
          <div
            className="text-caption px-1 pb-1"
            style={{ color: 'var(--text-ghost)' }}
          >
            Quick Actions
          </div>
          <button
            onClick={() => setPage('sessions')}
            className="flex items-center gap-2 w-full rounded-lg px-3 py-1.5 text-sm transition-colors"
            style={{ color: 'var(--accent-primary)' }}
          >
            <Plus size={14} />
            <span>New Session</span>
          </button>
          <button
            className="flex items-center gap-2 w-full rounded-lg px-3 py-1.5 text-sm transition-colors"
            style={{ color: 'var(--accent-error)' }}
          >
            <Square size={14} />
            <span>Stop All</span>
          </button>
        </div>
      )}

      {/* Collapse Toggle */}
      <div
        className="border-t px-2 py-2 shrink-0"
        style={{ borderColor: 'var(--border-subtle)' }}
      >
        <button
          onClick={toggleSidebar}
          className="flex items-center justify-center w-full rounded-lg py-1.5 transition-colors"
          style={{ color: 'var(--text-tertiary)' }}
        >
          {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </motion.aside>
  );
}
