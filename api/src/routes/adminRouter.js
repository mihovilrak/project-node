const express = require('express');
const taskTypeRouter = require('./taskTypesRouter');
const activityTypeRouter = require('./activityTypeRouter');
const adminController = require('../controllers/adminController');

module.exports = (pool) => {
  const router = express.Router();

  // Mount task types routes under /admin/task-types
  router.use('/task-types', (req, res, next) => {
    next();
  }, taskTypeRouter(pool));

  // Mount activity types routes under /admin/activity-types
  router.use('/activity-types', (req, res, next) => {
    next();
  }, activityTypeRouter(pool));

  // Get all permissions
  router.get('/permissions', (req, res) => {
    adminController.getAllPermissions(req, res, pool);
  });

  return router;
};