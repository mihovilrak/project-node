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

  // Update tag
  router.put('/:id', (req, res) => 
    tagController.updateTag(req, res, pool)); 

  // Delete tag
  router.delete('/:id', (req, res) => 
    tagController.deleteTag(req, res, pool));

  return router;
}; 