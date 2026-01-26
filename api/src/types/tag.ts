export interface Tag {
  id: number;
  name: string;
  color: string;
  icon: string;
  created_on: Date;
  updated_on: Date;
  active: boolean;
}

export interface TagCreateInput {
  name: string;
  color: string;
  icon?: string;
}

export interface TagUpdateInput {
  name?: string;
  color?: string;
  icon?: string;
  active?: boolean;
}

export interface TagWithTasks extends Tag {
  task_count: number;
  tasks: {
    id: string;
    name: string;
    status: string;
  }[];
}

export interface TaskTag {
  task_id: string;
  tag_id: string;
  created_on: Date;
}
