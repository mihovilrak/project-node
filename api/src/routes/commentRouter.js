const express = require('express');
const commentController = require('../controllers/commentController');

// Comment routes
module.exports = (pool) => {
  const router = express.Router();

  // Get task comments
  router.get('/', (req, res) => 
    commentController.getTaskComments(req, res, pool));

  // Create a comment
  router.post('/', (req, res) => 
    commentController.createComment(req, res, pool));

  // Edit a comment
  router.put('/:id', (req, res) => 
    commentController.editComment(req, res, pool));

  // Delete a comment
  router.delete('/:id', (req, res) => 
    commentController.deleteComment(req, res, pool));

  return router;
};
