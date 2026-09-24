export type MetricType =
  | 'notificationsSent'
  | 'emailErrors'
  | 'notificationErrors'
  | 'notificationsDeadLettered';

/**
 * Provide and manage counters and processing time for notification metrics, with methods to increment a metric, capture processing time, and schedule periodic metric logging.
 */
export interface Metrics {
  notificationsSent: number;
  emailErrors: number;
  notificationErrors: number;
  notificationsDeadLettered: number;
  lastProcessingTime: Date | null;
  increment(metric: MetricType): void;
  setProcessingTime(): void;
  scheduleLogMetrics(): void;
}
