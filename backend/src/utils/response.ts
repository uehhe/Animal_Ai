import { Response } from 'express';
import { ApiResponse } from '../types/index.js';

export class AppError extends Error {
  public statusCode: number;
  public errors?: string[];

  constructor(message: string, statusCode = 400, errors?: string[]) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const sendSuccess = <T>(res: Response, data: T, statusCode = 200, message?: string) => {
  const response: ApiResponse<T> = {
    success: true,
    data,
    ...(message && { message }),
  };
  return res.status(statusCode).json(response);
};

export const sendError = (res: Response, message: string, statusCode = 400, errors?: string[]) => {
  const response: ApiResponse = {
    success: false,
    message,
    ...(errors && errors.length > 0 && { errors }),
  };
  return res.status(statusCode).json(response);
};
