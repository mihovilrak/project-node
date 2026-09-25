import { Request, Response } from 'express';
import { Pool } from 'pg';
import path from 'path';
import fs from 'fs/promises';
import fsSync from 'fs';
import * as fileModel from '../models/fileModel';
import { hasPermission } from '../models/permissionModel';
import logger from '../utils/logger';
import { TaskRequest } from '../types/comment';
import { FileUploadRequest } from '../types/file';
import { CustomRequest } from '../types/express';
import { UPLOADS_DIR } from '../utils/uploadsDir';
import { parsePositiveInteger } from '../utils/requestParsing';
import { sessionUserId } from '../utils/sessionUser';

// Resolve a stored name inside UPLOADS_DIR, or null if it would escape it.
const safeUploadPath = (storedName: string): string | null => {
  const resolvedPath = path.resolve(UPLOADS_DIR, storedName);
  const relativePath = path.relative(UPLOADS_DIR, resolvedPath);
  return relativePath.startsWith('..') || path.isAbsolute(relativePath)
    ? null
    : resolvedPath;
};

const removeUpload = async (filePath: string): Promise<void> => {
  try {
    await fs.unlink(filePath);
  } catch (error) {
    logger.error({ err: error }, 'Error deleting file from disk');
  }
};

/**
 * Retrieve all files associated with a task.
 *
 * @param req Request carrying the taskId set by the router
 * @param res Express response
 * @param pool Database connection pool
 */
export const getTaskFiles = async (
  req: TaskRequest,
  res: Response,
  pool: Pool,
): Promise<void> => {
  const files = await fileModel.getTaskFiles(pool, req.taskId || '');
  res.status(200).json(files);
};

/**
 * Store metadata for an uploaded file. The blob is removed again if the request
 * is rejected or the insert fails.
 *
 * @param req FileUploadRequest containing the uploaded file and task id
 * @param res Express response
 * @param pool Database connection pool
 * @throws Rethrows the insert error, or the 401 from a missing session user,
 *   after removing the blob.
 */
export const uploadFile = async (
  req: FileUploadRequest,
  res: Response,
  pool: Pool,
): Promise<void> => {
  const file = req.file;
  if (!file) {
    res.status(400).json({ error: 'No file uploaded' });
    return;
  }

  try {
    const userId = sessionUserId(req);
    const taskId = parsePositiveInteger(req.taskId);
    if (taskId === null) {
      await removeUpload(file.path);
      res.status(400).json({ error: 'Invalid task ID' });
      return;
    }

    const fileData = await fileModel.createFile(
      pool,
      String(taskId),
      userId,
      file.originalname,
      file.filename,
      file.size,
      file.mimetype,
      path.join('uploads', file.filename),
    );
    res.status(201).json(fileData);
  } catch (error) {
    await removeUpload(file.path);
    throw error;
  }
};

/**
 * Stream a file to the user. Project access is enforced by requireFileAccess.
 *
 * @param req Express request with fileId in params
 * @param res Express response
 * @param pool Database connection pool
 */
export const downloadFile = async (
  req: Request,
  res: Response,
  pool: Pool,
): Promise<void> => {
  const file = await fileModel.getFileById(pool, req.params.fileId as string);
  if (!file || (req.taskId && String(file.task_id) !== req.taskId)) {
    res.status(404).json({ error: 'File not found' });
    return;
  }

  const resolvedPath = safeUploadPath(file.stored_name);
  if (!resolvedPath) {
    res.status(403).json({ error: 'Invalid file path' });
    return;
  }

  if (!fsSync.existsSync(resolvedPath)) {
    res.status(404).json({ error: 'File not found on disk' });
    return;
  }
  // Relative to root so a dot directory above the uploads dir is not refused.
  res.download(file.stored_name, file.original_name, { root: UPLOADS_DIR });
};

/**
 * Delete a file. Project access is enforced by requireFileAccess; a non-admin
 * may only delete their own uploads.
 *
 * @param req Express request with fileId in params
 * @param res Express response
 * @param pool Database connection pool
 */
export const deleteFile = async (
  req: Request,
  res: Response,
  pool: Pool,
): Promise<void> => {
  const userId = sessionUserId(req as CustomRequest);
  const isAdmin = await hasPermission(pool, userId, 'Admin');
  const deleted = await fileModel.deleteFile(
    pool,
    req.params.fileId as string,
    isAdmin ? undefined : userId,
    req.taskId,
  );
  if (!deleted) {
    if (isAdmin) {
      res.status(404).json({ error: 'File not found' });
    } else {
      res.status(403).json({ error: 'Access denied to this file' });
    }
    return;
  }

  const resolvedPath = safeUploadPath(deleted.stored_name);
  if (resolvedPath) {
    await removeUpload(resolvedPath);
  }

  res.status(200).json({ message: 'File deleted successfully' });
};
