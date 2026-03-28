import { useState, useRef, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Terminal, Bot, Brain, Sparkles, Plug, BarChart3, Settings, LayoutDashboard, ArrowRight } from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';
import type { NavigationPage } from '@/types/config';

interface CommandItem {
  id: string;
  label: string;
  category: string;
  icon: React.ElementType;
  action: () => void;
}

export function CommandPalette() {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { setPage, toggleCommandPalette } = useUIStore();

  const commands = useMemo<CommandItem[]>(() => {
    const nav = (page: NavigationPage) => () => { setPage(page); toggleCommandPalette(); };
    return [
      { id: 'dashboard', label: 'Dashboard', category: 'Navigation', icon: LayoutDashboard, action: nav('dashboard') },
      { id: 'sessions', label: 'Sessions', category: 'Navigation', icon: Terminal, action: nav('sessions') },
      { id: 'agents', label: 'Agents', category: 'Navigation', icon: Bot, action: nav('agents') },
      { id: 'memory', label: 'Memory', category: 'Navigation', icon: Brain, action: nav('memory') },
      { id: 'skills', label: 'Skills', category: 'Navigation', icon: Sparkles, action: nav('skills') },
      { id: 'plugins', label: 'Plugins', category: 'Navigation', icon: Plug, action: nav('plugins') },
      { id: 'metrics', label: 'Metrics', category: 'Navigation', icon: BarChart3, action: nav('metrics') },
      { id: 'config', label: 'Config', category: 'Navigation', icon: Settings, action: nav('config') },
      { id: 'new-session', label: 'New Session', category: 'Actions', icon: Terminal, action: nav('sessions') },
    ];
  }, [setPage, toggleCommandPalette]);

  const filtered = useMemo(() => {
    if (!query) return commands;
    const q = query.toLowerCase();
    return commands.filter((c) => c.label.toLowerCase().includes(q));
  }, [query, commands]);

  useEffect(() => { inputRef.current?.focus(); }, []);
  useEffect(() => { setSelectedIndex(0); }, [query]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') toggleCommandPalette();
    else if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIndex((i) => Math.max(i - 1, 0)); }
    else if (e.key === 'Enter' && filtered[selectedIndex]) filtered[selectedIndex].action();
  }

  return (
    <>
      <motion.div
        className="fixed inset-0 z-50"
        style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={toggleCommandPalette}
      />
      <motion.div
        className="fixed top-[18%] left-1/2 z-50 w-full max-w-[520px] rounded-2xl overflow-hidden glass"
        style={{
          transform: 'translateX(-50%)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.5), 0 0 1px rgba(255,255,255,0.1)',
        }}
        initial={{ opacity: 0, y: -12, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, scale: 0.98 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Input */}
        <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: 'var(--border-0)' }}>
          <Search size={15} style={{ color: 'var(--text-4)' }} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command..."
            className="flex-1 bg-transparent outline-none text-sm font-medium"
            style={{ color: 'var(--text-0)', caretColor: 'var(--cyan)' }}
          />
        </div>

        {/* Results */}
        <div className="max-h-[340px] overflow-y-auto py-1.5">
          {filtered.length === 0 && (
            <div className="px-5 py-10 text-center text-sm" style={{ color: 'var(--text-4)' }}>
              No results
            </div>
          )}
          {filtered.map((item, index) => {
            const Icon = item.icon;
            const isSelected = index === selectedIndex;
            return (
              <button
                key={item.id}
                onClick={item.action}
                onMouseEnter={() => setSelectedIndex(index)}
                className="flex items-center gap-3 w-full px-5 py-2.5 text-sm transition-all"
                style={{
                  background: isSelected ? 'var(--bg-hover)' : 'transparent',
                  color: isSelected ? 'var(--text-0)' : 'var(--text-2)',
                }}
              >
                <Icon size={15} style={{ color: isSelected ? 'var(--cyan)' : 'var(--text-4)', transition: 'color 150ms' }} />
                <span className="flex-1 text-left font-medium">{item.label}</span>
                {isSelected && <ArrowRight size={13} style={{ color: 'var(--text-4)' }} />}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div
          className="flex items-center gap-4 px-5 py-2.5 border-t text-[10px] font-mono"
          style={{ borderColor: 'var(--border-0)', color: 'var(--text-4)' }}
        >
          <span>↑↓ navigate</span>
          <span>↵ select</span>
          <span>esc close</span>
        </div>
      </motion.div>
    </>
  );
}
