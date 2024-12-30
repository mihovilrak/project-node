import winston from 'winston';
import { Metrics } from '../types/metrics.types';

const metricsLogger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'notification-metrics' },
  transports: [
    new winston.transports.File({ filename: 'metrics.log' })
  ]
});

const metrics: Metrics = {
  notificationsSent: 0,
  emailErrors: 0,
  lastProcessingTime: null,
  
  increment(metric: 'notificationsSent' | 'emailErrors'): void {
    this[metric]++;
    this.logMetrics();
  },

  setProcessingTime(): void {
    this.lastProcessingTime = new Date();
    this.logMetrics();
  },

  logMetrics(): void {
    if (process.env.METRICS_ENABLED === 'true') {
      metricsLogger.info('metrics_update', { ...this });
    }
  }
};

export { metrics };
