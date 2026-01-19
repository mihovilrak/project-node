import { Router, RequestHandler } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { Pool } from 'pg';
import checkPermission from '../middleware/permissionMiddleware';
import * as fileController from '../controllers/fileController';

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer configuration
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

// File routes
export default (pool: Pool): Router => {
  const router = Router();

  // Middleware to set taskId from query params
  router.use((req: any, res, next) => {
    if (req.query.taskId) {
      req.taskId = req.query.taskId;
    }
    next();
  });

  // Get task files
  router.get('/', ((req, res) =>
    fileController.getTaskFiles(req, res, pool)) as RequestHandler);

  // Upload a file
  router.post('/',
    upload.single('file'),
    ((req, res) => fileController.uploadFile(req, res, pool)) as RequestHandler);

  // Download a file
  router.get('/:fileId/download', ((req, res) =>
    fileController.downloadFile(req, res, pool)) as RequestHandler);

  // Delete a file
  router.delete('/:fileId', checkPermission(pool, 'Delete files'), ((req, res) =>
    fileController.deleteFile(req, res, pool)) as RequestHandler);

  return router;
};
