const express = require('express');
const timeLogController = require('../controllers/timeLogController');
const checkPermission = require('../middleware/checkPermission');

module.exports = (pool) => {
  const router = express.Router();

  // Get all time logs (admin only?)
  router.get('/', (req, res) =>
    timeLogController.getAllTimeLogs(req, res, pool));

  // Update time log
  router.put('/:timeLogId', 
    checkPermission(pool, 'Edit log'), 
    (req, res) =>
    timeLogController.updateTimeLog(req, res, pool));

  // Delete time log
  router.delete('/:timeLogId', 
    checkPermission(pool, 'Delete log'), 
    (req, res) =>
    timeLogController.deleteTimeLog(req, res, pool));

  return router;
}; 