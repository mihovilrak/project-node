import express, { Router } from 'express';
import { Pool } from 'pg';
import * as commentController from '../controllers/commentController';

// Comment routes
export default (pool: Pool): Router => {
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
