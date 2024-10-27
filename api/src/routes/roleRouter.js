const express = require('express');
const { getRoles } = require('../controllers/roleController');

module.exports = (pool) => {
  const router = express.Router();

  router.get('/', (req, res) => getRoles(req, res, pool));

  return router;
};