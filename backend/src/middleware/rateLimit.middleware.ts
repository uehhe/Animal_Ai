import rateLimit from 'express-rate-limit';

// Giới hạn chung cho toàn bộ API
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 300, // tối đa 300 requests
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Quá nhiều yêu cầu từ địa chỉ IP này. Vui lòng thử lại sau 15 phút.',
  },
});

// Giới hạn nghiêm ngặt riêng cho endpoint AI để chống lạm dụng và bảo vệ chi phí API
export const aiRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 phút
  max: 20, // tối đa 20 prompts / phút
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Bạn đang gửi quá nhiều yêu cầu đến Trợ lý AI. Vui lòng đợi 1 phút trước khi hỏi tiếp.',
  },
});

// Giới hạn cho đăng nhập / đăng ký tránh brute force
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Bạn đã thao tác đăng nhập/đăng ký quá nhiều lần. Vui lòng thử lại sau.',
  },
});
