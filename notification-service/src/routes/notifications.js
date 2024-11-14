const express = require('express');
const router = express.Router();
const pool = require('../db');
const rateLimiter = require('../middleware/rateLimiter');
const { validateNotification } = require('../middleware/validation');
const notificationService = require('../services/notificationService');

router.get('/:userId', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT n.*, nt.name as type, nt.icon, nt.color 
       FROM notifications n
       JOIN notification_types nt ON n.type_id = nt.id
       WHERE n.user_id = $1 AND n.active = true
       ORDER BY n.created_on DESC`,
      [req.params.userId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', rateLimiter, validateNotification, async (req, res) => {
  try {
    const { type, userId, data } = req.body;
    const notification = await notificationService.generateNotification(type, userId, data);
    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 