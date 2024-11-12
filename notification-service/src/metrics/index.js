const winston = require('winston');

const metricsLogger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'notification-metrics' },
  transports: [
    new winston.transports.File({ filename: 'metrics.log' })
  ]
});

const metrics = {
  notificationsSent: 0,
  emailErrors: 0,
  lastProcessingTime: null,
  
  increment(metric) {
    this[metric]++;
    this.logMetrics();
  },

  setProcessingTime() {
    this.lastProcessingTime = new Date();
    this.logMetrics();
  },

  logMetrics() {
    if (process.env.METRICS_ENABLED === 'true') {
      metricsLogger.info('metrics_update', { ...this });
    }
  }
};

module.exports = metrics;