const express = require('express');
const multer = require('multer');
const fileController = require('../controllers/fileController');

// Configure Multer for file upload
const upload = multer({ dest: 'uploads/' });

module.exports = (pool) => {
  const router = express.Router();

  // Get all files for a task
  router.get('/:task_id', (req, res) => fileController.getTaskFiles(req, res, pool));

  // Upload a file for a task
  router.post('/:task_id', upload.single('file'), (req, res) => fileController.uploadFile(req, res, pool));

  return router;
};
