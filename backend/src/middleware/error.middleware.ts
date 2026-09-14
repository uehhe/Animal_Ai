import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError, sendError } from '../utils/response.js';

export const notFoundHandler = (req: Request, res: Response) => {
  return sendError(res, `Đường dẫn [${req.method} ${req.originalUrl}] không tồn tại trên máy chủ.`, 404);
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('🔥 [Error Handler]:', err);

  if (err instanceof AppError) {
    return sendError(res, err.message, err.statusCode, err.errors);
  }

  if (err instanceof ZodError) {
    const errorMessages = err.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
    return sendError(res, 'Dữ liệu không hợp lệ.', 400, errorMessages);
  }

  // Handle Prisma common errors
  if ('code' in err) {
    const prismaError = err as { code: string; meta?: { target?: string[] } };
    if (prismaError.code === 'P2002') {
      const field = prismaError.meta?.target ? prismaError.meta.target.join(', ') : 'Trường dữ liệu';
      return sendError(res, `${field} này đã tồn tại trong hệ thống. Vui lòng chọn giá trị khác.`, 409);
    }
    if (prismaError.code === 'P2025') {
      return sendError(res, 'Không tìm thấy bản ghi dữ liệu yêu cầu.', 404);
    }
  }

  const message = process.env.NODE_ENV === 'production' 
    ? 'Đã xảy ra lỗi nội bộ trên máy chủ. Vui lòng thử lại sau.' 
    : err.message || 'Lỗi máy chủ không xác định.';

  return sendError(res, message, 500);
};
