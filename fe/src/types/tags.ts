export interface Tag {
  id: number;
  name: string;
  description: string | null;
  color: string;
  created_by: number;
  active: boolean;
  created_on: string;
  // Virtual fields
  creator_name?: string;
}

export interface TaskTag {
  task_id: number;
  tag_id: number;
  // Virtual fields
  tag_name?: string;
  tag_color?: string;
}

export interface TagSelectProps {
  selectedTags: Tag[];
  onTagsChange: (tags: Tag[]) => void;
}
