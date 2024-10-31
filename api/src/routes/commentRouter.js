const express = require('express');
const commentController = require('../controllers/commentController');

module.exports = (pool) => {
  const router = express.Router();

  router.get('/tasks/:taskId/comments', (req, res) => 
    commentController.getTaskComments(req, res, pool));

  router.post('/tasks/:taskId/comments', (req, res) => 
    commentController.createComment(req, res, pool));

  return router;
};
