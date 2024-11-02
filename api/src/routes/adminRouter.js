const express = require('express');
const taskTypeRouter = require('./taskTypeRouter');
const activityTypeRouter = require('./activityTypeRouter');

module.exports = (pool) => {
  const router = express.Router();

  // Mount task types routes under /admin/task-types
  router.use('/task-types', taskTypeRouter(pool));

  // Mount activity types routes under /admin/activity-types
  router.use('/activity-types', activityTypeRouter(pool));

  return router;
}; 