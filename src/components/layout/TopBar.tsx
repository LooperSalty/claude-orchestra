import { Search, Command } from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';

export function TopBar() {
  const { currentPage, toggleCommandPalette } = useUIStore();
  const pageTitle = currentPage.charAt(0).toUpperCase() + currentPage.slice(1);

  return (
    <header
      className="flex items-center justify-between h-12 px-5 border-b shrink-0"
      style={{ background: 'var(--bg-1)', borderColor: 'var(--border-0)' }}
    >
      <h1
        className="font-display text-sm font-semibold tracking-tight"
        style={{ color: 'var(--text-2)' }}
      >
        {pageTitle}
      </h1>

      <button
        onClick={toggleCommandPalette}
        className="flex items-center gap-2.5 rounded-xl px-3.5 py-[6px] text-xs transition-all btn-ghost"
        style={{ borderColor: 'var(--border-0)' }}
      >
        <Search size={13} style={{ color: 'var(--text-4)' }} />
        <span style={{ color: 'var(--text-4)' }}>Search</span>
        <div
          className="flex items-center gap-0.5 text-[10px] font-mono rounded-md px-1.5 py-[2px] ml-3"
          style={{ background: 'var(--bg-3)', color: 'var(--text-4)' }}
        >
          <Command size={9} />K
        </div>
      </button>
    </header>
  );
}
