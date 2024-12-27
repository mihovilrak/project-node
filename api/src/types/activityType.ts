export interface ActivityType {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  created_on: Date;
  updated_on: Date;
  active: boolean;
}

export interface ActivityTypeCreateInput {
  name: string;
  description?: string;
  color: string;
  icon?: string;
}

export interface ActivityTypeUpdateInput {
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
  active?: boolean;
}
