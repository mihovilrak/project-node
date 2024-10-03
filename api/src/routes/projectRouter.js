const express = require('express');
const projectController = require('../controllers/projectController');

module.exports = (pool) => {
  const router = express.Router();

  router.get('/', (req, res) => projectController.getAllProjects(req, res, pool));
  router.get('/:id', (req, res) => projectController.getOneProject(req, res, pool));
  router.post('/', (req, res) => projectController.createProject(req, res, pool));
  router.patch('/:id/status', (req, res) => projectController.changeProjectStatus(req, res, pool));
  router.delete('/:id', (req, res) => projectController.deleteProject(req, res, pool));

  return router;
};
