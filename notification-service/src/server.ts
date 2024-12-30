import express, { Request, Response, NextFunction } from 'express';
import { emailService } from './services/emailService';
import { pool } from './db';
import { config } from './config';
import { rateLimiter } from './middleware/rateLimiter';
import { notificationRoutes } from './routes/notifications';
import { metrics } from './metrics';
import { logger } from './utils/logger';

const app = express();

app.use(express.json());
app.use('/api/notifications', rateLimiter, notificationRoutes);

// Health check endpoint
app.get('/health', async (req: Request, res: Response) => {
  try {
    await pool.query('SELECT 1');
    await emailService.transporter.verify();
    
    res.json({
      status: 'healthy',
      database: 'connected',
      email: 'connected',
      metrics: {
        notificationsSent: metrics.notificationsSent,
        emailErrors: metrics.emailErrors,
        lastProcessingTime: metrics.lastProcessingTime
      },
      timestamp: new Date()
    });
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const port = config.app.port || 5001;
const server = app.listen(port, () => {
  logger.info(`Server running on port ${port}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

export { server };
