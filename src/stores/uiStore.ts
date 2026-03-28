import { create } from 'zustand';
import type { NavigationPage } from '@/types/config';

interface UIState {
  currentPage: NavigationPage;
  sidebarCollapsed: boolean;
  commandPaletteOpen: boolean;
  activeSessionPanel: string | null;
  splitLayout: 'single' | 'horizontal' | 'vertical' | 'quad';
  notifications: Notification[];
}

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message?: string;
  timestamp: number;
}

interface UIActions {
  setPage: (page: NavigationPage) => void;
  toggleSidebar: () => void;
  toggleCommandPalette: () => void;
  setActiveSessionPanel: (id: string | null) => void;
  setSplitLayout: (layout: UIState['splitLayout']) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
}

export const useUIStore = create<UIState & UIActions>((set) => ({
  currentPage: 'dashboard',
  sidebarCollapsed: false,
  commandPaletteOpen: false,
  activeSessionPanel: null,
  splitLayout: 'single',
  notifications: [],

  setPage: (page) => set({ currentPage: page }),

  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  toggleCommandPalette: () =>
    set((state) => ({ commandPaletteOpen: !state.commandPaletteOpen })),

  setActiveSessionPanel: (id) => set({ activeSessionPanel: id }),

  setSplitLayout: (layout) => set({ splitLayout: layout }),

  addNotification: (notification) =>
    set((state) => ({
      notifications: [
        ...state.notifications,
        {
          ...notification,
          id: crypto.randomUUID(),
          timestamp: Date.now(),
        },
      ],
    })),

  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
}));
