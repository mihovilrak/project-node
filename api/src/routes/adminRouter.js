const express = require('express');
const taskRouter = require('./taskRouter');
const activityTypeRouter = require('./activityTypeRouter');
const { checkPermission } = require('../middleware/permissionMiddleware');

module.exports = (pool) => {
  const router = express.Router();

  // Mount task types routes under /admin/task-types
  router.use('/task-types', checkPermission(pool, 'Admin'), (req, res, next) => {
    req.url = '/types' + req.url;
    next();
  }, taskRouter(pool));

  // Mount activity types routes under /admin/activity-types
  router.use('/activity-types', checkPermission(pool, 'Admin'), (req, res, next) => {
    req.url = '/activity-types' + req.url;
    next();
  }, activityTypeRouter(pool));

  return router;
}; 