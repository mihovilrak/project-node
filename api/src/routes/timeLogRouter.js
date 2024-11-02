const express = require('express');
const timeLogController = require('../controllers/timeLogController');

// Time log routes
module.exports = (pool) => {
  const router = express.Router();

  // Get task time logs
  router.get('/tasks/:taskId/time-logs', (req, res) => 
    timeLogController.getTaskTimeLogs(req, res, pool));

  // Create time log
  router.post('/tasks/:taskId/time-logs', (req, res) => 
    timeLogController.createTimeLog(req, res, pool));

  // Update time log
  router.put('/tasks/:taskId/time-logs/:timeLogId', (req, res) => 
    timeLogController.updateTimeLog(req, res, pool));

  // Delete time log
  router.delete('/tasks/:taskId/time-logs/:timeLogId', (req, res) => 
    timeLogController.deleteTimeLog(req, res, pool));

  // Get user time logs
  router.get('/time-logs', (req, res) => 
    timeLogController.getUserTimeLogs(req, res, pool));

  return router;
}; 