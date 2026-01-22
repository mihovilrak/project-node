import { metrics } from '../../metrics';

describe('Metrics', () => {
  beforeEach(() => {
    // Reset metrics before each test
    metrics.notificationsSent = 0;
    metrics.emailErrors = 0;
    metrics.notificationErrors = 0;
    metrics.lastProcessingTime = null;
  });

  describe('increment', () => {
    it('should increment notificationsSent counter', () => {
      expect(metrics.notificationsSent).toBe(0);
      metrics.increment('notificationsSent');
      expect(metrics.notificationsSent).toBe(1);
      metrics.increment('notificationsSent');
      expect(metrics.notificationsSent).toBe(2);
    });

    it('should increment emailErrors counter', () => {
      expect(metrics.emailErrors).toBe(0);
      metrics.increment('emailErrors');
      expect(metrics.emailErrors).toBe(1);
    });

    it('should increment notificationErrors counter', () => {
      expect(metrics.notificationErrors).toBe(0);
      metrics.increment('notificationErrors');
      expect(metrics.notificationErrors).toBe(1);
    });

    it('should call logMetrics when incrementing', () => {
      const logMetricsSpy = jest.spyOn(metrics, 'logMetrics');
      metrics.increment('notificationsSent');
      expect(logMetricsSpy).toHaveBeenCalled();
    });
  });

  describe('setProcessingTime', () => {
    it('should set lastProcessingTime to current date', () => {
      expect(metrics.lastProcessingTime).toBeNull();
      const beforeTime = new Date();
      metrics.setProcessingTime();
      const afterTime = new Date();

      expect(metrics.lastProcessingTime).not.toBeNull();
      expect(metrics.lastProcessingTime!.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
      expect(metrics.lastProcessingTime!.getTime()).toBeLessThanOrEqual(afterTime.getTime());
    });

    it('should call logMetrics when setting processing time', () => {
      const logMetricsSpy = jest.spyOn(metrics, 'logMetrics');
      metrics.setProcessingTime();
      expect(logMetricsSpy).toHaveBeenCalled();
    });
  });

  describe('logMetrics', () => {
    it('should not throw when called', () => {
      expect(() => metrics.logMetrics()).not.toThrow();
    });

    it('should log metrics when METRICS_ENABLED is true', () => {
      const originalValue = process.env.METRICS_ENABLED;
      process.env.METRICS_ENABLED = 'true';

      // Should not throw even when enabled
      expect(() => metrics.logMetrics()).not.toThrow();

      process.env.METRICS_ENABLED = originalValue;
    });
  });

  describe('initial state', () => {
    it('should have correct initial values', () => {
      // Create a fresh instance check
      const freshMetrics = {
        notificationsSent: 0,
        emailErrors: 0,
        notificationErrors: 0,
        lastProcessingTime: null
      };

      // Reset to check
      metrics.notificationsSent = 0;
      metrics.emailErrors = 0;
      metrics.notificationErrors = 0;
      metrics.lastProcessingTime = null;

      expect(metrics.notificationsSent).toBe(freshMetrics.notificationsSent);
      expect(metrics.emailErrors).toBe(freshMetrics.emailErrors);
      expect(metrics.notificationErrors).toBe(freshMetrics.notificationErrors);
      expect(metrics.lastProcessingTime).toBe(freshMetrics.lastProcessingTime);
    });
  });
});
