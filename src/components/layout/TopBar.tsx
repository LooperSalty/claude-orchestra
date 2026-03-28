import { Search, Command, ChevronRight, Settings } from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';

const PAGE_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  sessions: 'Sessions',
  agents: 'Agents',
  skills: 'Skills',
  metrics: 'Metriques',
  config: 'Configuration',
  plugins: 'Plugins',
  memory: 'Memory',
};

export function TopBar() {
  const { currentPage, toggleCommandPalette, setPage } = useUIStore();
  const pageLabel = PAGE_LABELS[currentPage] ?? currentPage.charAt(0).toUpperCase() + currentPage.slice(1);

  return (
    <header
      className="flex items-center justify-between shrink-0"
      style={{
        height: 50, paddingInline: 20,
        background: 'var(--bg-1)', borderBottom: '1px solid var(--border-0)',
      }}
    >
      {/* Breadcrumb nav */}
      <div className="flex items-center" style={{ gap: 8 }}>
        <button
          onClick={() => setPage('dashboard')}
          className="font-display font-semibold"
          style={{
            color: 'var(--text-3)', fontSize: 13, background: 'none', border: 'none',
            cursor: 'pointer', padding: 0,
            transition: 'color 0.15s ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-1)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-3)'; }}
        >
          Orchestra
        </button>
        {currentPage !== 'dashboard' && (
          <>
            <ChevronRight size={12} style={{ color: 'var(--text-4)' }} />
            <span className="font-display font-semibold" style={{ color: 'var(--text-1)', fontSize: 13 }}>
              {pageLabel}
            </span>
          </>
        )}
      </div>

      {/* Right side */}
      <div className="flex items-center" style={{ gap: 8 }}>
        {/* Search button */}
        <button
          onClick={toggleCommandPalette}
          className="flex items-center btn-ghost"
          style={{
            gap: 10, borderRadius: 10, padding: '6px 14px', fontSize: 12,
            border: '1px solid var(--border-1)',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--border-2)'; e.currentTarget.style.background = 'var(--bg-3)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-1)'; e.currentTarget.style.background = ''; }}
        >
          <Search size={13} style={{ color: 'var(--text-4)' }} />
          <span style={{ color: 'var(--text-4)' }}>Search</span>
          <div
            className="flex items-center font-mono"
            style={{
              gap: 2, fontSize: 10, padding: '2px 6px', borderRadius: 5,
              background: 'var(--bg-4)', color: 'var(--text-4)', marginLeft: 8,
            }}
          >
            <Command size={9} />K
          </div>
        </button>

        {/* Settings icon */}
        <button
          onClick={() => setPage('config')}
          className="flex items-center justify-center"
          style={{
            width: 34, height: 34, borderRadius: 10,
            background: 'none', border: '1px solid var(--border-0)',
            cursor: 'pointer', transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-3)'; e.currentTarget.style.borderColor = 'var(--border-1)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.borderColor = 'var(--border-0)'; }}
        >
          <Settings size={14} style={{ color: 'var(--text-3)' }} />
        </button>

        {/* User avatar */}
        <div
          className="flex items-center justify-center font-display font-bold"
          style={{
            width: 30, height: 30, borderRadius: '50%',
            background: 'var(--gradient-primary)', color: '#000',
            fontSize: 11, flexShrink: 0,
          }}
        >
          A
        </div>
      </div>
    </header>
  );
}
