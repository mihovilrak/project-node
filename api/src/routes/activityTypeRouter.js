const express = require('express');
const activityTypeController = require('../controllers/activityTypeController');

module.exports = (pool) => {
  const router = express.Router();

  // Get all activity types
  router.get('/', (req, res) => 
    activityTypeController.getActivityTypes(req, res, pool));

  // Create activity type
  router.post('/', (req, res) => 
    activityTypeController.createActivityType(req, res, pool));

  // Update activity type
  router.put('/:id', (req, res) => 
    activityTypeController.updateActivityType(req, res, pool));

  // Delete activity type
  router.delete('/:id', (req, res) => 
    activityTypeController.deleteActivityType(req, res, pool));

  return router;
}; 