export interface Metric {
  id: number;
  sessionId: string;
  metricType: MetricType;
  value: number;
  metadata: Record<string, unknown>;
  recordedAt: string;
}

export type MetricType = 'tokens' | 'cost' | 'latency' | 'errors';

export interface DashboardStats {
  totalSessions: number;
  activeSessions: number;
  totalTokensToday: number;
  totalCostToday: number;
  avgLatency: number;
  errorRate: number;
}

export interface BudgetAlert {
  type: 'daily' | 'weekly' | 'monthly';
  limitCents: number;
  currentCents: number;
  percentage: number;
}
