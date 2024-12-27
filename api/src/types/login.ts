export interface LoginInput {
  login: string;
  password: string;
}

export interface LoginResponse {
  id: string;
  login: string;
  role_id: number;
}

export interface PasswordResetInput {
  email: string;
}

export interface PasswordUpdateInput {
  oldPassword: string;
  newPassword: string;
}
