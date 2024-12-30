export type MetricType = 'notificationsSent' | 'emailErrors' | 'notificationErrors';

export interface Metrics {
  notificationsSent: number;
  emailErrors: number;
  lastProcessingTime: Date | null;
  increment(metric: MetricType): void;
  setProcessingTime(): void;
  logMetrics(): void;
}
