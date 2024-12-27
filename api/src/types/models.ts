import { Pool, QueryResult, QueryResultRow, Submittable } from 'pg';

export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  role: string;
  created_at: Date;
  updated_at: Date;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  owner_id: string;
  status: string;
  created_at: Date;
  updated_at: Date;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  project_id: string;
  assignee_id: string;
  status: string;
  priority: string;
  due_date: Date;
  created_at: Date;
  updated_at: Date;
}

// Instead of extending Pool, let's just use Pool type directly
export type DatabasePool = Pool;
