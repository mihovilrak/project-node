export interface SessionUser {
  id: number;
  login: string;
  role_id: number;
}

export interface Session {
  user?: SessionUser;
}

export interface SessionResponse {
  user?: SessionUser;
  message?: string;
  error?: string;
}
