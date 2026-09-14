import { app } from './app.js';
import { config } from './config/index.js';
import { prisma } from './prisma/client.js';

const PORT = Number(process.env.PORT) || config.port || 3000;

const startServer = async () => {
  try {
    // Kiểm tra kết nối cơ sở dữ liệu
    await prisma.$connect();
    console.log('✅ Kết nối cơ sở dữ liệu PostgreSQL thành công.');

    const server = app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 PetCare AI Backend đang lắng nghe tại cổng http://0.0.0.0:${PORT}`);
      console.log(`📡 API Base URL: http://0.0.0.0:${PORT}/api`);
      console.log(`🩺 Health check: http://0.0.0.0:${PORT}/api/health-check`);
    });

    const shutdown = async () => {
      console.log('🛑 Đang đóng máy chủ an toàn...');
      server.close(async () => {
        await prisma.$disconnect();
        console.log('👋 Đã ngắt kết nối cơ sở dữ liệu. Tạm biệt!');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    console.error('❌ Lỗi khởi động máy chủ:', error);
    process.exit(1);
  }
};

startServer();