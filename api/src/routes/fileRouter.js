const express = require('express');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fileController = require('../controllers/fileController');

// Multer configuration
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

// File routes
module.exports = (pool) => {
  const router = express.Router();

  // Get task files
  router.get('/tasks/:taskId/files', (req, res) => 
    fileController.getTaskFiles(req, res, pool));

  // Upload a file
  router.post('/tasks/:taskId/files', 
    upload.single('file'),
    (req, res) => fileController.uploadFile(req, res, pool));

  // Download a file
  router.get('/tasks/:taskId/files/:fileId/download', (req, res) => 
    fileController.downloadFile(req, res, pool));

  // Delete a file
  router.delete('/tasks/:taskId/files/:fileId', (req, res) => 
    fileController.deleteFile(req, res, pool));

  return router;
};
