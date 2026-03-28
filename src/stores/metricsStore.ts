import { create } from 'zustand';
import type { DashboardStats, Metric, BudgetAlert } from '@/types/metrics';

interface MetricsState {
  stats: DashboardStats;
  recentMetrics: Metric[];
  budgetAlerts: BudgetAlert[];
}

interface MetricsActions {
  setStats: (stats: DashboardStats) => void;
  addMetric: (metric: Metric) => void;
  setRecentMetrics: (metrics: Metric[]) => void;
  setBudgetAlerts: (alerts: BudgetAlert[]) => void;
}

const INITIAL_STATS: DashboardStats = {
  totalSessions: 0,
  activeSessions: 0,
  totalTokensToday: 0,
  totalCostToday: 0,
  avgLatency: 0,
  errorRate: 0,
};

export const useMetricsStore = create<MetricsState & MetricsActions>(
  (set) => ({
    stats: INITIAL_STATS,
    recentMetrics: [],
    budgetAlerts: [],

    setStats: (stats) => set({ stats }),

    addMetric: (metric) =>
      set((state) => ({
        recentMetrics: [...state.recentMetrics, metric].slice(-1000),
      })),

    setRecentMetrics: (metrics) => set({ recentMetrics: metrics }),
    setBudgetAlerts: (alerts) => set({ budgetAlerts: alerts }),
  })
);
