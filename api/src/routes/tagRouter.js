const express = require('express');
const tagController = require('../controllers/tagController');

// Tag routes
module.exports = (pool) => {
  const router = express.Router();

  // Get all tags
  router.get('/', (req, res) => 
    tagController.getTags(req, res, pool));

  // Create tag
  router.post('/', (req, res) => 
    tagController.createTag(req, res, pool));

  // Add tags to task
  router.post('/tasks/:taskId/tags', (req, res) => 
    tagController.addTaskTags(req, res, pool));

  // Remove tag from task
  router.delete('/tasks/:taskId/tags/:tagId', (req, res) => 
    tagController.removeTaskTag(req, res, pool));

  return router;
}; 