import express, { Router } from 'express';
import { Pool } from 'pg';
import * as tagController from '../controllers/tagController';

// Tag routes
export default (pool: Pool): Router => {
  const router = express.Router();

  // Get all tags
  router.get('/', (req, res) => 
    tagController.getTags(req, res, pool));

  // Create tag
  router.post('/', (req, res) => 
    tagController.createTag(req, res, pool));

  // Update tag
  router.put('/:id', (req, res) => 
    tagController.updateTag(req, res, pool)); 

  // Delete tag
  router.delete('/:id', (req, res) => 
    tagController.deleteTag(req, res, pool));

  return router;
};
