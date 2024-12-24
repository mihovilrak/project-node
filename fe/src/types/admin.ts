export interface Permission {
  id: number;
  name: string;
  description: string | null;
  active: boolean;
  created_on: string;
  updated_on: string | null;
}

export interface Role {
  id: number;
  name: string;
  description: string | null;
  active: boolean;
  created_on: string;
  updated_on: string | null;
  // Virtual fields from joins
  permissions?: Permission[];
}

export type ThemeContextType = {
  mode: 'light' | 'dark';
  toggleTheme: () => void;
};