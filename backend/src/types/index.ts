import { Request } from 'express';

export type UserRole = 'USER' | 'ADMIN';

export interface AuthTokenPayload {
  id: string;
  email: string;
  role: UserRole;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthTokenPayload;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}
