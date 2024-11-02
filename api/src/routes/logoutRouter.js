const express = require('express');
const loginController = require('../controllers/loginController');

// Logout routes
module.exports = () => {
  const router = express.Router();

  // Logout
  router.post('/', (req, res) =>
    loginController.logout(req, res));

  return router;
};