import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { verifyToken } from '../utils/jwt.js';
import { sendError } from '../utils/response.js';
import { prisma } from '../prisma/client.js';

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return sendError(res, 'Vui lòng đăng nhập để tiếp tục.', 401);
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    return next();
  } catch {
    return sendError(res, 'Phiên đăng nhập đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.', 401);
  }
};

export const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return sendError(res, 'Bạn không có quyền quản trị để thực hiện hành động này.', 403);
  }
  return next();
};

export const checkPetOwnership = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const petId = req.params.petId || req.params.id;
  const userId = req.user?.id;

  if (!userId) {
    return sendError(res, 'Yêu cầu không hợp lệ.', 401);
  }

  if (req.user?.role === 'ADMIN') {
    return next();
  }

  if (!petId) {
    return sendError(res, 'Mã thú cưng không được cung cấp.', 400);
  }

  try {
    const pet = await prisma.pet.findUnique({
      where: { id: petId },
      select: { userId: true },
    });

    if (!pet) {
      return sendError(res, 'Không tìm thấy thú cưng trong hệ thống.', 404);
    }

    if (pet.userId !== userId) {
      return sendError(res, 'Bạn không có quyền truy cập dữ liệu của thú cưng này.', 403);
    }

    return next();
  } catch (error) {
    return next(error);
  }
};
