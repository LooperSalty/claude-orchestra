import { Search, Command } from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';

export function TopBar() {
  const { currentPage, toggleCommandPalette } = useUIStore();

  const pageTitle = currentPage.charAt(0).toUpperCase() + currentPage.slice(1);

  return (
    <header
      className="flex items-center justify-between h-12 px-4 border-b shrink-0"
      style={{
        background: 'var(--bg-surface)',
        borderColor: 'var(--border-subtle)',
      }}
    >
      <h1 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
        {pageTitle}
      </h1>

      <button
        onClick={toggleCommandPalette}
        className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors"
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-default)',
          color: 'var(--text-tertiary)',
        }}
      >
        <Search size={14} />
        <span>Search...</span>
        <kbd
          className="flex items-center gap-0.5 text-xs rounded px-1.5 py-0.5 ml-4"
          style={{
            background: 'var(--bg-hover)',
            color: 'var(--text-ghost)',
          }}
        >
          <Command size={10} />K
        </kbd>
      </button>

      <div className="flex items-center gap-2">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium"
          style={{
            background: 'var(--accent-primary-glow)',
            color: 'var(--accent-primary)',
          }}
        >
          A
        </div>
      </div>
    </header>
  );
}
