const express = require('express');
const taskRouter = require('./taskRouter');
const activityTypeRouter = require('./activityTypeRouter');

module.exports = (pool) => {
  const router = express.Router();

  // Mount task types routes under /admin/task-types
  router.use('/task-types', (req, res, next) => {
    // Rewrite the path to remove /admin/task-types prefix
    req.url = '/types' + req.url;
    next();
  }, taskRouter(pool));

  // Mount activity types routes under /admin/activity-types
  router.use('/activity-types', activityTypeRouter(pool));

  return router;
}; 