const express = require('express');
const sessionController = require('../controllers/sessionController');

module.exports = () => {
  const router = express.Router();

  router.get('/', (req, res) => sessionController.session(req, res));

  return router;
};