const express = require('express');
const loginController = require('../controllers/loginController');

module.exports = () => {
  const router = express.Router();

  router.post('/', (req, res) => loginController.logout(req, res));

  return router;
};