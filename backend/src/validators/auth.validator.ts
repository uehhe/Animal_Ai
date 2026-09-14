import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự').max(100, 'Họ tên không được vượt quá 100 ký tự'),
  email: z.string().email('Địa chỉ email không đúng định dạng'),
  password: z
    .string()
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
    .max(50, 'Mật khẩu không được quá 50 ký tự'),
});

export const loginSchema = z.object({
  email: z.string().email('Địa chỉ email không đúng định dạng'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự').max(100).optional(),
  avatar: z.string().url('Đường dẫn ảnh đại diện không hợp lệ').or(z.literal('')).optional(),
});

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, 'Vui lòng nhập mật khẩu cũ'),
  newPassword: z.string().min(6, 'Mật khẩu mới phải có ít nhất 6 ký tự').max(50),
});
