import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { sendError } from '../utils/response.js';

export const validateRequest = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = await schema.parseAsync(req.body);
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map((err) => `${err.path.join('.')}: ${err.message}`);
        return sendError(res, 'Dữ liệu đầu vào không hợp lệ.', 400, errorMessages);
      }
      return sendError(res, 'Lỗi kiểm tra dữ liệu đầu vào.', 400);
    }
  };
};
