const express = require('express');
const commentController = require('../controllers/commentController');

module.exports = (pool) => {
  const router = express.Router();

  // Get all comments for a task
  router.get('/:task_id', (req, res) => commentController.getTaskComments(req, res, pool));

  // Add a comment to a task
  router.post('/:task_id', (req, res) => commentController.addComment(req, res, pool));
  
  // Edit a comment
  router.patch('/:comment_id', (req, res) => commentController.editComment(req, res, pool));

  // Delete a comment
  router.delete('/:comment_id', (req, res) => commentController.deleteComment(req, res, pool));

  return router;
};
