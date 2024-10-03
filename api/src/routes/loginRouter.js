const express = require('express');
const loginController = require('../controllers/loginController');

module.exports = (pool) => {
  const router = express.Router();

  router.post('/login', (req, res) => loginController.login(req, res, pool));
  router.post('/register', (req, res) => loginController.register(req, res, pool));

  return router;
};
