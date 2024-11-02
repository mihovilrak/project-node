const express = require('express');
const commentController = require('../controllers/commentController');

// Comment routes
module.exports = (pool) => {
  const router = express.Router();

  // Get task comments
  router.get('/tasks/:taskId/comments', (req, res) => 
    commentController.getTaskComments(req, res, pool));

  // Create a comment
  router.post('/tasks/:taskId/comments', (req, res) => 
    commentController.createComment(req, res, pool));

  return router;
};
