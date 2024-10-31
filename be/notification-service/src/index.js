const { Pool } = require('pg');
const schedule = require('node-schedule');
const config = require('./config');
const emailService = require('./services/emailService');
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
  } catch (error) {
    logger.error('Failed to send notification email:', error);
  }
};

const generateTaskNotifications = async () => {
  try {
    // Check for tasks due soon
    const dueSoonResult = await pool.query(`
      WITH inserted_notifications AS (
        INSERT INTO notifications (user_id, type_id, title, message, link)
        SELECT 
          t.assignee_id,
          (SELECT id FROM notification_types WHERE name = 'Task Due Soon'),
          'Task Due Soon',
          'Task "' || t.name || '" is due ' || 
          CASE 
            WHEN t.due_date::date = CURRENT_DATE THEN 'today'
            WHEN t.due_date::date = CURRENT_DATE + 1 THEN 'tomorrow'
            ELSE 'in ' || (t.due_date::date - CURRENT_DATE) || ' days'
          END,
          '/tasks/' || t.id
        FROM tasks t
        WHERE 
          t.assignee_id IS NOT NULL
          AND t.due_date BETWEEN NOW() AND NOW() + INTERVAL '24 hours'
          AND t.status != 'Completed'
          AND NOT EXISTS (
            SELECT 1 FROM notifications n
            WHERE n.user_id = t.assignee_id
            AND n.link = '/tasks/' || t.id
            AND n.type_id = (SELECT id FROM notification_types WHERE name = 'Task Due Soon')
            AND n.created_on > NOW() - INTERVAL '24 hours'
          )
        RETURNING *
      )
      SELECT 
        n.*,
        t.name as task_name,
        t.priority,
        t.status,
        p.name as project_name
      FROM inserted_notifications n
      JOIN tasks t ON t.id = (regexp_match(n.link, '/tasks/(\d+)'))[1]::integer
      JOIN projects p ON p.id = t.project_id
    `);

    // Send emails for new notifications
    for (const row of dueSoonResult.rows) {
      await sendNotificationEmail(row.user_id, row, {
        id: (row.link.match(/\/tasks\/(\d+)/) || [])[1],
        name: row.task_name,
        project_name: row.project_name,
        priority: row.priority,
        status: row.status
      });
    }

    // Check for new assignments
    const newAssignmentsResult = await pool.query(`
      INSERT INTO notifications (user_id, type_id, title, message, link)
      SELECT 
        t.assignee_id,
        (SELECT id FROM notification_types WHERE name = 'Task Assigned'),
        'New Task Assigned',
        'You have been assigned to task "' || t.name || '"',
        '/tasks/' || t.id
      FROM tasks t
      WHERE 
        t.assignee_id IS NOT NULL
        AND t.created_on > NOW() - INTERVAL '5 minutes'
        AND NOT EXISTS (
          SELECT 1 FROM notifications n
          WHERE n.user_id = t.assignee_id
          AND n.link = '/tasks/' || t.id
          AND n.type_id = (SELECT id FROM notification_types WHERE name = 'Task Assigned')
        )
    `);

    console.log('Notification check completed:', new Date());
  } catch (error) {
    console.error('Error generating notifications:', error);
  }
};

// Run every 5 minutes
schedule.scheduleJob('*/5 * * * *', generateTaskNotifications);

console.log('Notification service started');

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Closing pool...');
  await pool.end();
  process.exit(0);
}); 