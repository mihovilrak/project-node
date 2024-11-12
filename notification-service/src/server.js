const express = require('express');
const emailService = require('./services/emailService');
const { Pool } = require('pg');
const config = require('./config');
const rateLimiter = require('./middleware/rateLimiter');
const { validateNotification } = require('./middleware/validation');
const metrics = require('./metrics');

const app = express();
const pool = new Pool(config.db);

app.use(express.json());
app.use('/api/notifications', rateLimiter);

app.get('/health', async (req, res) => {
  try {
    // Check database connection
    await pool.query('SELECT 1');
    // Check email service
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
    res.status(503).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server running on port ${port}`));

module.exports = app;