const express = require('express');
const profileController = require('../controllers/profileController');

module.exports = (pool) => {
  const router = express.Router();

  // Get user profile
  router.get('/', (req, res) => 
    profileController.getProfile(req, res, pool));

  // Update user profile
  router.put('/', (req, res) => 
    profileController.updateProfile(req, res, pool));

  // Change password
  router.put('/password', (req, res) => 
    profileController.changePassword(req, res, pool));

  return router;
}; 