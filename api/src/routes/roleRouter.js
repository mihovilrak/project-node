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
  router.post('/', (req, res, next) => {
    checkAdminAccess(req, res, pool)
      .then(isAdmin => {
        if (isAdmin) {
          roleController.createRole(req, res, pool);
        }
      })
      .catch(next);
  });

  // Update role
  router.put('/:id', (req, res, next) => {
    checkAdminAccess(req, res, pool)
      .then(isAdmin => {
        if (isAdmin) {
          roleController.updateRole(req, res, pool);
        }
      })
      .catch(next);
  });

  return router;
};