const express = require('express');
const sessionController = require('../controllers/sessionController');

// Session routes
module.exports = () => {
  const router = express.Router();

  // Get session
  router.get('/', (req, res) =>
    sessionController.session(req, res));

  return router;
};