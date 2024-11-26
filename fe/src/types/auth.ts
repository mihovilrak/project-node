export interface AppLogin {
  id: number;
  user_id: number;
  ip_address: string;
  user_agent: string;
  created_on: string;
  // Virtual fields
  user_name?: string;
  user_email?: string;
}

export interface LoginRequest {
  login: string;
  password: string;
}

export interface LoginResponse {
  user: SessionUser;
  message: string;
}

export interface SessionUser {
  id: number;
  login: string;
  name: string;
  surname: string;
  email: string;
  role_id: number;
  role_name: string;
  permissions: string[];
  avatar_url: string | null;
  settings: {
    timezone: string;
    language: string;
    date_format: string;
    time_format: string;
  };
}

export interface SessionResponse {
  user: SessionUser | null;
}

export interface PasswordChangeRequest {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface AuthError {
  error: string;
  details?: string;
}

export interface SessionConfig {
  cookie: {
    maxAge: number;
    secure: boolean;
    sameSite: 'lax' | 'strict' | 'none';
  };
  rolling: boolean;
  saveUninitialized: boolean;
  resave: boolean;
}

export interface LoginValidationError {
  field: 'login' | 'password';
  message: string;
}

export interface PasswordValidationError {
  field: 'current_password' | 'new_password' | 'confirm_password';
  message: string;
}
