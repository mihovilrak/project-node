export interface UserStatus {
  id: number;
  name: string;
  color: string;
  description: string | null;
  active: boolean;
  created_on: string;
}

export interface ProjectStatus {
  id: number;
  name: string;
  color: string;
  description: string | null;
  active: boolean;
  created_on: string;
}

export interface TaskStatus {
  id: number;
  name: string;
  color: string;
  description: string | null;
  active: boolean;
  created_on: string;
} 