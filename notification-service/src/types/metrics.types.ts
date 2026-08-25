export type MetricType = 'notificationsSent' | 'emailErrors' | 'notificationErrors';

export interface Metrics {
  notificationsSent: number;
  emailErrors: number;
  notificationErrors: number;
  lastProcessingTime: Date | null;
  increment(metric: MetricType): void;
  setProcessingTime(): void;
  scheduleLogMetrics(): void;
  logMetrics(): void;
}
