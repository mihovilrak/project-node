const express = require('express');
const loginController = require('../controllers/loginController');

// Login routes
module.exports = (pool) => {  
  const router = express.Router();

  // Login
  router.post('/', (req, res) =>
    loginController.login(req, res, pool));

  return router;
};
