/**
 * Task file routes, mounted at `/api/tasks/{id}/files` and `/api/files`.
 *
 * OpenAPI tag: Files.
 *
 * @packageDocumentation
 */
import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { Pool } from 'pg';
import checkPermission from '../middleware/permissionMiddleware';
import {
  requireFileAccess,
  requireTaskAccessBy,
} from '../middleware/projectAccessMiddleware';
import * as fileController from '../controllers/fileController';
import { withPool } from '../utils/withPool';
import { uploadFileFilter } from '../utils/uploadFilter';
import { UPLOADS_DIR as uploadsDir } from '../utils/uploadsDir';

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: uploadFileFilter,
});

// File routes
export default (pool: Pool): Router => {
  const router = Router();

  // Mounted under /tasks/:id the task router has already set req.taskId.
  router.use((req, res, next) => {
    if (!req.taskId && typeof req.query.taskId === 'string') {
      req.taskId = req.query.taskId;
    }
    next();
  });

  const fileAccess = requireFileAccess(pool);

  const taskAccess = requireTaskAccessBy(pool, (req) => req.taskId);

  // Get task files
  router.get('/', taskAccess, withPool(pool, fileController.getTaskFiles));

  // Upload a file
  router.post(
    '/',
    taskAccess,
    upload.single('file'),
    withPool(pool, fileController.uploadFile),
  );

  // Download a file
  router.get(
    '/:fileId/download',
    fileAccess,
    withPool(pool, fileController.downloadFile),
  );

  // Delete a file
  router.delete(
    '/:fileId',
    checkPermission(pool, 'Delete files'),
    fileAccess,
    withPool(pool, fileController.deleteFile),
  );

  return router;
};
