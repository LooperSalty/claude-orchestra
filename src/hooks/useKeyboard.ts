import { useEffect } from 'react';
import { useUIStore } from '@/stores/uiStore';

export function useKeyboard() {
  const { toggleCommandPalette, setPage } = useUIStore();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Ctrl+K — Command Palette
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        toggleCommandPalette();
      }

      // Ctrl+N — New Session
      if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        setPage('sessions');
      }

      // Ctrl+, — Settings
      if (e.ctrlKey && e.key === ',') {
        e.preventDefault();
        setPage('config');
      }

      // Ctrl+Shift+S — Skills
      if (e.ctrlKey && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        setPage('skills');
      }

      // Ctrl+Shift+M — Memory
      if (e.ctrlKey && e.shiftKey && e.key === 'M') {
        e.preventDefault();
        setPage('memory');
      }

      // Ctrl+Shift+P — Plugins
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        e.preventDefault();
        setPage('plugins');
      }

      // Ctrl+1..8 — Navigate to page by index
      if (e.ctrlKey && !e.shiftKey && e.key >= '1' && e.key <= '8') {
        e.preventDefault();
        const pages = [
          'dashboard', 'sessions', 'agents', 'memory',
          'skills', 'plugins', 'metrics', 'config',
        ] as const;
        const idx = parseInt(e.key) - 1;
        if (idx < pages.length) {
          setPage(pages[idx]);
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleCommandPalette, setPage]);
}
