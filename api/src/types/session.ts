export interface SessionUser {
  id: string;
  login: string;
  role: string;
}

export interface Session {
  user?: SessionUser;
}

export interface SessionResponse {
  user?: SessionUser;
  message?: string;
  error?: string;
}
