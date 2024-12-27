import { Request, Response } from 'express';
import { Pool } from 'pg';
import * as activityTypeModel from '../models/activityTypeModel';
import { CustomRequest } from '../types/express';
import {
  ActivityTypeCreateInput,
  ActivityTypeUpdateInput,
} from '../types/activityType';

// Get all activity types
export const getActivityTypes = async (
  req: Request,
  res: Response,
  pool: Pool
): Promise<Response | void> => {
  try {
    const activityTypes = await activityTypeModel.getActivityTypes(pool);
    res.status(200).json(activityTypes);
  } catch (error) {
    console.error('Error fetching activity types:', error);
    res.status(500).json({ error: 'Failed to fetch activity types' });
  }
};

// Create a new activity type
export const createActivityType = async (
  req: CustomRequest,
  res: Response,
  pool: Pool
): Promise<Response | void> => {
  try {
    const {
      name,
      description,
      color,
      icon,
    } = req.body as ActivityTypeCreateInput;
    const userId = req.session?.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!color || !color.match(/^#[0-9A-Fa-f]{6}$/)) {
      return res.status(400).json({ error: 'Invalid color format' });
    }

    const activityType = await activityTypeModel.createActivityType(
      pool,
      name,
      description || null,
      color,
      icon || null
    );
    res.status(201).json(activityType);
  } catch (error) {
    console.error('Error creating activity type:', error);
    res.status(500).json({ error: 'Failed to create activity type' });
  }
};

// Update an activity type
export const updateActivityType = async (
  req: Request,
  res: Response,
  pool: Pool
): Promise<Response | void> => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      color,
      icon,
    } = req.body as ActivityTypeUpdateInput;

    const activityType = await activityTypeModel.updateActivityType(
      pool,
      id || '',
      name || '',
      description || '',
      color || '',
      icon || ''
    );

    if (!activityType) {
      return res.status(404).json({ error: 'Activity type not found' });
    }

    res.status(200).json(activityType);
  } catch (error) {
    console.error('Error updating activity type:', error);
    res.status(500).json({ error: 'Failed to update activity type' });
  }
};

// Delete an activity type
export const deleteActivityType = async (
  req: Request,
  res: Response,
  pool: Pool
): Promise<Response | void> => {
  try {
    const { id } = req.params;
    const result = await activityTypeModel.deleteActivityType(pool, id);
    
    if (!result) {
      return res.status(404).json({ error: 'Activity type not found' });
    }
    
    res.status(200).json({ message: 'Activity type deleted successfully' });
  } catch (error) {
    console.error('Error deleting activity type:', error);
    res.status(500).json({ error: 'Failed to delete activity type' });
  }
};

// Get available icons
export const getAvailableIcons = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  try {
    // You can customize this list based on your icon library
    const icons = [
      'work', 'code', 'bug_report', 'build', 'meeting_room',
      'description', 'schedule', 'search', 'analytics', 'design_services',
      'cloud', 'support', 'more_horiz'
    ];
    res.status(200).json(icons);
  } catch (error) {
    console.error('Error fetching icons:', error);
    res.status(500).json({ error: 'Failed to fetch icons' });
  }
};
