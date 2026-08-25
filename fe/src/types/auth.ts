import { User } from "./user";

export interface Permission {
  permission: string;
}

export interface LoginRequest {
  login: string;
  password: string;
}

export interface AuthContextType {
  currentUser: User | null;
  userPermissions: Permission[];
  permissionsLoading: boolean;
  error: string | null;
  login: (login: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
}

export interface AuthProviderProps {
  children: React.ReactNode;
}
