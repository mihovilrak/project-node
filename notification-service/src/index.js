const { Pool } = require('pg');
const schedule = require('node-schedule');
const config = require('./config');
const emailService = require('./services/emailService');
const metrics = require('./metrics');
const server = require('./server');
const logger = require('./utils/logger');

const pool = new Pool({
  user: config.db.user,
  host: config.db.host,
  database: config.db.database,
  password: config.db.password,
  port: config.db.port,
});

const sendNotificationEmail = async (userId, notification, taskDetails) => {
  try {
    // Get user email
    const userResult = await pool.query(
      'SELECT email, name FROM users WHERE id = $1',
      [userId]
    );
    
    if (userResult.rows.length === 0) {
      return;
    }

    const user = userResult.rows[0];
    const baseUrl = config.app.baseUrl || 'http://localhost:3000';
    
    await emailService.sendEmail(
      user.email,
      notification.title,
      'taskDueSoon',
      {
        userName: user.name,
        taskName: taskDetails.name,
        dueText: notification.message.split('is due ')[1],
        projectName: taskDetails.project_name,
        priority: taskDetails.priority,
        status: taskDetails.status,
        taskUrl: `${baseUrl}/tasks/${taskDetails.id}`
      }
    );
    metrics.increment('notificationsSent');
  } catch (error) {
    logger.error('Failed to send notification email:', error);
  }
};

const notificationTypes = {
  TASK_DUE_SOON: 'Task Due Soon',
  TASK_ASSIGNED: 'Task Assigned',
  TASK_UPDATED: 'Task Updated',
  TASK_COMMENT: 'Task Comment',
  TASK_COMPLETED: 'Task Completed',
  PROJECT_UPDATE: 'Project Update'
};

const generateNotification = async (pool, type, userId, data) => {
  const typeId = await pool.query(
    'SELECT id FROM notification_types WHERE name = $1',
    [type]
  );

  const notification = {
    user_id: userId,
    type_id: typeId.rows[0].id,
    title: type,
    message: generateMessage(type, data),
    link: generateLink(type, data)
  };

  return pool.query(`
    INSERT INTO notifications (user_id, type_id, title, message, link)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `, [notification.user_id, notification.type_id, notification.title, 
      notification.message, notification.link]);
};

const generateTaskNotifications = async () => {
  try {
    await generateDueSoonNotifications();
    await generateAssignedNotifications();
    await generateTaskUpdatedNotifications();
    await generateTaskCompletedNotifications();
    await generateProjectUpdateNotifications();
  } catch (error) {
    console.error('Error generating notifications:', error);
    metrics.increment('notificationErrors');
  }
};

// Run every 5 minutes
schedule.scheduleJob('*/5 * * * *', generateTaskNotifications);

console.log('Notification service started');

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  try {
    await pool.end();
    server.close();
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown:', error);
    process.exit(1);
  }
});