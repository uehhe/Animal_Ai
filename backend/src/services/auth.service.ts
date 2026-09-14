import { prisma } from '../prisma/client.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { generateToken } from '../utils/jwt.js';
import { AppError } from '../utils/response.js';

export class AuthService {
  async register(data: { name: string; email: string; password: string }) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase().trim() },
    });

    if (existingUser) {
      throw new AppError('Email này đã được đăng ký trong hệ thống. Vui lòng sử dụng email khác hoặc đăng nhập.', 409);
    }

    const hashedPassword = await hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        name: data.name.trim(),
        email: data.email.toLowerCase().trim(),
        password: hashedPassword,
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(data.name)}`,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        createdAt: true,
      },
    });

    // Tạo thông báo chào mừng ban đầu
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: 'Chào mừng bạn đến với PetCare AI! 🎉',
        message: 'Bắt đầu bằng việc thêm hồ sơ thú cưng đầu tiên của bạn để thiết lập lịch chăm sóc và sức khỏe nhé.',
        type: 'SYSTEM',
        link: '/pets',
      },
    });

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return { user, token };
  }

  async login(data: { email: string; password: string }) {
    const user = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase().trim() },
    });

    if (!user) {
      throw new AppError('Email hoặc mật khẩu không chính xác.', 401);
    }

    if (!user.isActive) {
      throw new AppError('Tài khoản của bạn đã bị tạm khóa. Vui lòng liên hệ quản trị viên.', 403);
    }

    const isMatch = await comparePassword(data.password, user.password);
    if (!isMatch) {
      throw new AppError('Email hoặc mật khẩu không chính xác.', 401);
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        createdAt: user.createdAt,
      },
      token,
    };
  }

  async getCurrentUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new AppError('Người dùng không tồn tại.', 404);
    }

    return user;
  }

  async updateProfile(userId: string, data: { name?: string; avatar?: string }) {
    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        createdAt: true,
      },
    });

    return user;
  }

  async changePassword(userId: string, data: { oldPassword: string; newPassword: string }) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('Người dùng không tồn tại.', 404);
    }

    const isMatch = await comparePassword(data.oldPassword, user.password);
    if (!isMatch) {
      throw new AppError('Mật khẩu hiện tại không chính xác.', 400);
    }

    const hashedPassword = await hashPassword(data.newPassword);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { message: 'Đổi mật khẩu thành công.' };
  }
}

export const authService = new AuthService();
