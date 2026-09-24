import express, { Request, Response, NextFunction } from 'express';
import type { Server } from 'http';
import { emailService } from './services/emailService';
import { pool } from './db';
import { config } from './config';
import { logger } from './utils/logger';

const SMTP_PROBE_INTERVAL_MS = 60000;

let smtpHealthy: boolean | null = null;
let smtpProbeTimer: NodeJS.Timeout | null = null;

const probeSmtp = async (): Promise<void> => {
  if (!config.app.emailEnabled) {
    smtpHealthy = null;
    return;
  }
  try {
    await emailService.transporter.verify();
    smtpHealthy = true;
  } catch (error) {
    smtpHealthy = false;
    logger.warn({ err: error }, 'SMTP probe failed');
  }
};

/**
 * Start a background timer that periodically probes SMTP connectivity; do nothing if the probe is already scheduled.
 */
export const startSmtpProbe = (): void => {
  if (smtpProbeTimer) return;
  void probeSmtp();
  smtpProbeTimer = setInterval(() => void probeSmtp(), SMTP_PROBE_INTERVAL_MS);
  // Never hold the event loop open just for the probe.
  smtpProbeTimer.unref();
};

/**
 * Stop the recurring SMTP probe timer if it's currently active by clearing its interval and resetting the timer reference.
 */
export const stopSmtpProbe = (): void => {
  if (!smtpProbeTimer) return;
  clearInterval(smtpProbeTimer);
  smtpProbeTimer = null;
};

/**
 * Configures an Express application with health check and readiness endpoints.
 */
export const createServer = (): express.Express => {
  const app = express();

  // Compose healthcheck target: the only endpoint allowed to touch the database.
  app.get('/ready', async (_req: Request, res: Response) => {
    try {
      await pool.query('SELECT 1');
      res.status(200).json({ status: 'ready' });
    } catch {
      res.status(503).json({ status: 'not ready' });
    }
  });

  // Answers from cached probe state so it cannot be used to hammer SMTP or the pool.
  app.get('/health', (_req: Request, res: Response) => {
    const healthy = smtpHealthy !== false;
    res
      .status(healthy ? 200 : 503)
      .json({ status: healthy ? 'healthy' : 'unhealthy' });
  });

  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    logger.error({ err }, 'Unhandled error');
    res.status(500).json({ error: 'Internal server error' });
  });

  return app;
};

/**
 * Start an HTTP server listening on the configured port, log the startup, initiate the SMTP probe, and return the Server instance.
 */
export const startServer = (): Server => {
  const port = config.app.port || 5001;
  const server = createServer().listen(port, () => {
    logger.info(`Server running on port ${port}`);
  });
  startSmtpProbe();
  return server;
};
