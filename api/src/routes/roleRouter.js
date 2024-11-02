const express = require('express');
const roleController = require('../controllers/roleController');

// Role routes
module.exports = (pool) => {
  const router = express.Router();

  // Get roles
  router.get('/', (req, res) =>
    roleController.getRoles(req, res, pool));

  return router;
};