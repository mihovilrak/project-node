const express = require('express');
const roleController = require('../controllers/roleController');
const { checkPermission } = require('../middleware/permissionMiddleware');

// Role routes
module.exports = (pool) => {
  const router = express.Router();

  // Get roles
  router.get('/', (req, res) =>
    roleController.getRoles(req, res, pool));

  // Create role
  router.post('/', checkPermission(pool, 'Admin'), (req, res) =>
    roleController.createRole(req, res, pool));

  // Update role
  router.put('/:id', checkPermission(pool, 'Admin'), (req, res) =>
    roleController.updateRole(req, res, pool));

  return router;
};