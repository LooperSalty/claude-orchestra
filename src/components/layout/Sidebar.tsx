import { motion } from 'framer-motion';
import {
  LayoutDashboard, Terminal, Bot, Brain, Sparkles,
  Plug, BarChart3, Settings, PanelLeftClose, PanelLeftOpen,
  Plus,
} from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';
import { useSessionStore } from '@/stores/sessionStore';
import type { NavigationPage } from '@/types/config';

const NAV_ITEMS: { id: NavigationPage; label: string; icon: React.ElementType; accent?: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'sessions', label: 'Sessions', icon: Terminal, accent: 'var(--cyan)' },
  { id: 'agents', label: 'Agents', icon: Bot, accent: 'var(--orange)' },
  { id: 'memory', label: 'Memory', icon: Brain, accent: 'var(--violet)' },
  { id: 'skills', label: 'Skills', icon: Sparkles, accent: 'var(--amber)' },
  { id: 'plugins', label: 'Plugins', icon: Plug, accent: 'var(--green)' },
  { id: 'metrics', label: 'Metrics', icon: BarChart3, accent: 'var(--cyan)' },
  { id: 'config', label: 'Config', icon: Settings },
];

export function Sidebar() {
  const { currentPage, setPage, sidebarCollapsed, toggleSidebar } = useUIStore();
  const activeSessions = useSessionStore((s) =>
    s.sessions.filter((sess) => sess.status === 'running').length
  );

  return (
    <motion.aside
      className="flex flex-col h-full border-r noise"
      style={{
        background: 'var(--bg-1)',
        borderColor: 'var(--border-0)',
        width: sidebarCollapsed ? 60 : 240,
      }}
      animate={{ width: sidebarCollapsed ? 60 : 240 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* ── Logo ── */}
      <div className="flex items-center gap-3 px-5 h-16 shrink-0 border-b" style={{ borderColor: 'var(--border-0)' }}>
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center font-display font-black text-xs shrink-0"
          style={{
            background: 'var(--gradient-primary)',
            color: '#000',
            boxShadow: '0 0 20px rgba(0, 212, 255, 0.2)',
          }}
        >
          CO
        </div>
        {!sidebarCollapsed && (
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col"
          >
            <span className="font-display font-bold text-sm leading-none" style={{ color: 'var(--text-0)' }}>
              Orchestra
            </span>
            <span className="text-[10px] leading-none mt-0.5" style={{ color: 'var(--text-4)' }}>
              v0.1.0
            </span>
          </motion.div>
        )}
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 px-3 py-5 space-y-1.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          const badge = item.id === 'sessions' && activeSessions > 0 ? activeSessions : null;

          return (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              className="flex items-center gap-3 w-full rounded-xl px-3 py-3 transition-all group relative"
              style={{
                background: isActive ? 'var(--bg-4)' : 'transparent',
                color: isActive ? 'var(--text-0)' : 'var(--text-3)',
              }}
            >
              {/* Active indicator bar */}
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
                  style={{ background: item.accent ?? 'var(--cyan)' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                />
              )}

              <Icon
                size={18}
                className="shrink-0 transition-colors"
                style={{
                  color: isActive ? (item.accent ?? 'var(--cyan)') : undefined,
                }}
              />

              {!sidebarCollapsed && (
                <>
                  <span className="flex-1 text-left text-[13px] font-medium tracking-tight group-hover:text-[var(--text-1)] transition-colors">
                    {item.label}
                  </span>
                  {badge !== null && (
                    <span
                      className="text-[10px] font-semibold font-display px-1.5 py-0.5 rounded-full"
                      style={{
                        background: 'var(--green-glow)',
                        color: 'var(--green)',
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

      {/* ── Quick Actions ── */}
      {!sidebarCollapsed && (
        <div className="px-3 pb-2 space-y-1">
          <button
            onClick={() => setPage('sessions')}
            className="flex items-center gap-2 w-full rounded-xl px-3 py-2 text-[13px] font-medium transition-all btn-ghost"
          >
            <Plus size={14} style={{ color: 'var(--cyan)' }} />
            <span>New Session</span>
          </button>
        </div>
      )}

      {/* ── Collapse ── */}
      <div className="border-t px-2 py-2 shrink-0" style={{ borderColor: 'var(--border-0)' }}>
        <button
          onClick={toggleSidebar}
          className="flex items-center justify-center w-full rounded-xl py-2 transition-colors"
          style={{ color: 'var(--text-4)' }}
        >
          {sidebarCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
        </button>
      </div>
    </motion.aside>
  );
}
