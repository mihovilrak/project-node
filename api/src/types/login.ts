export interface LoginInput {
  login: string;
  password: string;
}

export interface LoginResponse {
  id: string;
  name: string;
  surname: string;
  email: string;
  login: string;
  is_admin: boolean;
  created_on: Date;
  updated_on: Date;
  active: boolean;
}

export interface PasswordResetInput {
  email: string;
}

export interface PasswordUpdateInput {
  oldPassword: string;
  newPassword: string;
}
