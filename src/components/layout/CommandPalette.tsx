import { useState, useRef, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Terminal, Bot, Brain, Sparkles, Plug, BarChart3, Settings, LayoutDashboard } from 'lucide-react';
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
    const navigate = (page: NavigationPage) => () => {
      setPage(page);
      toggleCommandPalette();
    };

    return [
      { id: 'dashboard', label: 'Go to Dashboard', category: 'Navigate', icon: LayoutDashboard, action: navigate('dashboard') },
      { id: 'sessions', label: 'Go to Sessions', category: 'Navigate', icon: Terminal, action: navigate('sessions') },
      { id: 'agents', label: 'Go to Agents', category: 'Navigate', icon: Bot, action: navigate('agents') },
      { id: 'memory', label: 'Go to Memory', category: 'Navigate', icon: Brain, action: navigate('memory') },
      { id: 'skills', label: 'Go to Skills', category: 'Navigate', icon: Sparkles, action: navigate('skills') },
      { id: 'plugins', label: 'Go to Plugins', category: 'Navigate', icon: Plug, action: navigate('plugins') },
      { id: 'metrics', label: 'Go to Metrics', category: 'Navigate', icon: BarChart3, action: navigate('metrics') },
      { id: 'config', label: 'Go to Config', category: 'Navigate', icon: Settings, action: navigate('config') },
      { id: 'new-session', label: 'New Session', category: 'Actions', icon: Terminal, action: navigate('sessions') },
    ];
  }, [setPage, toggleCommandPalette]);

  const filtered = useMemo(() => {
    if (query === '') return commands;
    const lower = query.toLowerCase();
    return commands.filter(
      (c) =>
        c.label.toLowerCase().includes(lower) ||
        c.category.toLowerCase().includes(lower)
    );
  }, [query, commands]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') {
      toggleCommandPalette();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && filtered[selectedIndex]) {
      filtered[selectedIndex].action();
    }
  }

  return (
    <>
      {/* Overlay */}
      <motion.div
        className="fixed inset-0 z-50"
        style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={toggleCommandPalette}
      />

      {/* Palette */}
      <motion.div
        className="fixed top-[20%] left-1/2 z-50 w-full max-w-lg rounded-xl border overflow-hidden"
        style={{
          background: 'var(--bg-elevated)',
          borderColor: 'var(--border-default)',
          transform: 'translateX(-50%)',
        }}
        initial={{ opacity: 0, y: -20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.98 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      >
        {/* Input */}
        <div
          className="flex items-center gap-3 px-4 py-3 border-b"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          <Search size={16} style={{ color: 'var(--text-tertiary)' }} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command..."
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: 'var(--text-primary)' }}
          />
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto py-2">
          {filtered.length === 0 && (
            <div className="px-4 py-8 text-center text-sm" style={{ color: 'var(--text-tertiary)' }}>
              No results found
            </div>
          )}
          {filtered.map((item, index) => {
            const Icon = item.icon;
            const isSelected = index === selectedIndex;
            return (
              <button
                key={item.id}
                onClick={item.action}
                className="flex items-center gap-3 w-full px-4 py-2 text-sm transition-colors"
                style={{
                  background: isSelected ? 'var(--bg-hover)' : 'transparent',
                  color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                }}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <Icon size={16} style={{ color: 'var(--accent-primary)' }} />
                <span className="flex-1 text-left">{item.label}</span>
                <span className="text-xs" style={{ color: 'var(--text-ghost)' }}>
                  {item.category}
                </span>
              </button>
            );
          })}
        </div>
      </motion.div>
    </>
  );
}
