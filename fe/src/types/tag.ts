export interface Tag {
  id: number;
  name: string;
  color: string;
  icon?: string;
  description: string | null;
  created_by: number;
  active: boolean;
  created_on: string;
  creator_name?: string;
}

export interface TagSelectProps {
  selectedTags: Tag[];
  onTagsChange: (tags: Tag[]) => void;
}
