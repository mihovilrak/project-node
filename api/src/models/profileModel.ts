import { Pool } from 'pg';
import { Profile, ProfileUpdateInput } from '../types/profile';
import { Task } from '../types/task';
import { Project } from '../types/project';

// Get user profile
export const getProfile = async (
  pool: Pool,
  userId: string
): Promise<Profile | null> => {
  const result = await pool.query(
    `SELECT *
     FROM v_profiles
     WHERE id = $1`,
    [userId]
  );
  return result.rows[0] || null;
};

// Update user profile
export const updateProfile = async (
  pool: Pool,
  userId: string,
  profileData: ProfileUpdateInput
): Promise<Profile | null> => {
  const { email, name, surname } = profileData;
  
  const result = await pool.query(
    `UPDATE users 
     SET (email, name, surname, updated_on) 
     = ($1, $2, $3, CURRENT_TIMESTAMP)
     WHERE id = $4 
     RETURNING *`,
    [email, name, surname, userId]
  );
  return result.rows[0] || null;
};

// Verify user password
export const verifyPassword = async (
  pool: Pool,
  userId: string,
  password: string
): Promise<boolean> => {
  const result = await pool.query(
    `SELECT EXISTS(SELECT 1 FROM authentification($1, $2))`,
    [userId, password]
  );
  return result.rows[0].exists;
};

// Change user password
export const changePassword = async (
  pool: Pool,
  userId: string,
  password: string
): Promise<Profile | null> => {
  const result = await pool.query(
    `UPDATE users 
     SET (password, updated_on) 
     = (crypt($1, gen_salt('bf', 12)), CURRENT_TIMESTAMP)
     WHERE id = $2
     RETURNING *`,
    [password, userId]
  );
  return result.rows[0] || null;
};

// Get recent tasks
export const getRecentTasks = async (
  pool: Pool,
  userId: string
): Promise<Task[]> => {
  const result = await pool.query(
    `SELECT * FROM recent_tasks($1)`,
    [userId]
  );
  return result.rows;
};

// Get recent projects
export const getRecentProjects = async (
  pool: Pool,
  userId: string
): Promise<Project[]> => {
  const result = await pool.query(
    `SELECT * FROM recent_projects($1)`,
    [userId]
  );
  return result.rows;
};
