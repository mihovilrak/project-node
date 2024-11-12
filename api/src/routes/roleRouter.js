const express = require('express');
const roleController = require('../controllers/roleController');
const { checkAdminAccess } = require('../controllers/adminController');

// Role routes
module.exports = (pool) => {
  const router = express.Router();

  // Get roles
  router.get('/', (req, res) =>
    roleController.getRoles(req, res, pool));

  // Create role
  router.post('/', async (req, res, next) => {
    const isAdmin = await checkAdminAccess(req, res, pool);
    if (isAdmin) {
      roleController.createRole(req, res, pool);
    }
  });

  // Update role
  router.put('/:id', async (req, res, next) => {
    const isAdmin = await checkAdminAccess(req, res, pool);
    if (isAdmin) {
      roleController.updateRole(req, res, pool);
    }
  });

  return router;
};