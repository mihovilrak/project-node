const express = require('express');
const taskRouter = require('./taskRouter');
const activityTypeRouter = require('./activityTypeRouter');
const adminController = require('../controllers/adminController');
const { checkPermission } = require('../middleware/permissionMiddleware');

module.exports = (pool) => {
  const router = express.Router();

  // Mount task types routes under /admin/task-types
  router.use('/task-types', checkPermission(pool, 'Admin'), (req, res, next) => {
    next();
  }, taskRouter(pool));

  // Mount activity types routes under /admin/activity-types
  router.use('/activity-types', checkPermission(pool, 'Admin'), (req, res, next) => {
    next();
  }, activityTypeRouter(pool));

  // Get all permissions
  router.get('/permissions', checkPermission(pool, 'Admin'), (req, res) => {
    adminController.getAllPermissions(req, res, pool);
  });

  return router;
};