import { motion } from 'framer-motion';
import {
  LayoutDashboard, Terminal, Bot, Brain, Sparkles,
  Plug, BarChart3, Settings, PanelLeftClose, PanelLeftOpen,
  Plus,
} from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';
import { useSessionStore } from '@/stores/sessionStore';
import type { NavigationPage } from '@/types/config';

const MAIN_NAV: { id: NavigationPage; label: string; icon: React.ElementType; accent?: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'sessions', label: 'Sessions', icon: Terminal, accent: 'var(--cyan)' },
  { id: 'agents', label: 'Agents', icon: Bot, accent: 'var(--orange)' },
  { id: 'memory', label: 'Memory', icon: Brain, accent: 'var(--violet)' },
];

const TOOLS_NAV: { id: NavigationPage; label: string; icon: React.ElementType; accent?: string }[] = [
  { id: 'skills', label: 'Skills', icon: Sparkles, accent: 'var(--amber)' },
  { id: 'plugins', label: 'Plugins', icon: Plug, accent: 'var(--green)' },
  { id: 'metrics', label: 'Metrics', icon: BarChart3, accent: 'var(--cyan)' },
  { id: 'config', label: 'Config', icon: Settings },
];

function NavItem({ item, isActive, collapsed, badge, onClick }: {
  item: typeof MAIN_NAV[0];
  isActive: boolean;
  collapsed: boolean;
  badge?: number | null;
  onClick: () => void;
}) {
  const Icon = item.icon;
  return (
    <button
      onClick={onClick}
      className="flex items-center w-full rounded-xl transition-all group relative"
      style={{
        gap: '12px',
        padding: collapsed ? '10px' : '10px 14px',
        justifyContent: collapsed ? 'center' : 'flex-start',
        background: isActive ? 'var(--bg-4)' : 'transparent',
        color: isActive ? 'var(--text-0)' : 'var(--text-3)',
      }}
    >
      {isActive && (
        <motion.div
          layoutId="sidebar-active"
          className="absolute left-0 top-1/2 -translate-y-1/2 rounded-r-full"
          style={{
            width: '3px',
            height: '20px',
            background: item.accent ?? 'var(--cyan)',
          }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        />
      )}
      <Icon
        size={18}
        className="shrink-0 transition-colors"
        style={{ color: isActive ? (item.accent ?? 'var(--cyan)') : undefined }}
      />
      {!collapsed && (
        <>
          <span
            className="flex-1 text-left font-medium tracking-tight group-hover:text-[var(--text-1)] transition-colors"
            style={{ fontSize: '13px' }}
          >
            {item.label}
          </span>
          {badge != null && badge > 0 && (
            <span
              className="font-semibold font-display rounded-full"
              style={{
                fontSize: '10px',
                padding: '2px 7px',
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
}

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
        width: sidebarCollapsed ? 64 : 240,
      }}
      animate={{ width: sidebarCollapsed ? 64 : 240 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* ── Logo ── */}
      <div
        className="flex items-center shrink-0 border-b"
        style={{
          gap: '12px',
          padding: sidebarCollapsed ? '20px 16px' : '20px 20px',
          borderColor: 'var(--border-0)',
        }}
      >
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center font-display font-black text-xs shrink-0"
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
            <span className="font-display font-bold leading-none" style={{ fontSize: '15px', color: 'var(--text-0)' }}>
              Orchestra
            </span>
            <span className="leading-none" style={{ fontSize: '10px', color: 'var(--text-4)', marginTop: '4px' }}>
              v0.1.0
            </span>
          </motion.div>
        )}
      </div>

      {/* ── Main Navigation ── */}
      <nav
        className="flex-1 overflow-y-auto"
        style={{ padding: sidebarCollapsed ? '16px 8px' : '16px 12px' }}
      >
        {!sidebarCollapsed && (
          <div
            className="font-display font-semibold uppercase"
            style={{
              fontSize: '10px',
              letterSpacing: '0.08em',
              color: 'var(--text-4)',
              padding: '0 14px 10px',
            }}
          >
            Main
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {MAIN_NAV.map((item) => (
            <NavItem
              key={item.id}
              item={item}
              isActive={currentPage === item.id}
              collapsed={sidebarCollapsed}
              badge={item.id === 'sessions' ? activeSessions : null}
              onClick={() => setPage(item.id)}
            />
          ))}
        </div>

        {/* Separator */}
        <div
          style={{
            height: '1px',
            background: 'var(--border-0)',
            margin: sidebarCollapsed ? '16px 4px' : '20px 14px',
          }}
        />

        {!sidebarCollapsed && (
          <div
            className="font-display font-semibold uppercase"
            style={{
              fontSize: '10px',
              letterSpacing: '0.08em',
              color: 'var(--text-4)',
              padding: '0 14px 10px',
            }}
          >
            Tools
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {TOOLS_NAV.map((item) => (
            <NavItem
              key={item.id}
              item={item}
              isActive={currentPage === item.id}
              collapsed={sidebarCollapsed}
              onClick={() => setPage(item.id)}
            />
          ))}
        </div>
      </nav>

      {/* ── Quick Action ── */}
      {!sidebarCollapsed && (
        <div style={{ padding: '0 12px 12px' }}>
          <button
            onClick={() => setPage('sessions')}
            className="flex items-center w-full rounded-xl btn-ghost"
            style={{ gap: '10px', padding: '10px 14px', fontSize: '13px', fontWeight: 500 }}
          >
            <Plus size={15} style={{ color: 'var(--cyan)' }} />
            <span>New Session</span>
          </button>
        </div>
      )}

      {/* ── Collapse ── */}
      <div className="border-t shrink-0" style={{ borderColor: 'var(--border-0)', padding: '10px 8px' }}>
        <button
          onClick={toggleSidebar}
          className="flex items-center justify-center w-full rounded-xl transition-colors"
          style={{ padding: '8px', color: 'var(--text-4)' }}
        >
          {sidebarCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
        </button>
      </div>
    </motion.aside>
  );
}
