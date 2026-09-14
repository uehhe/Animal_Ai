import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/index.js';
import { apiLimiter } from './middleware/rateLimit.middleware.js';
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js';
import apiRouter from './routes/index.js';

export const app = express();

// 1. Bảo mật HTTP Headers với Helmet
app.use(helmet());

// 2. Cấu hình CORS
app.use(
  cors({
    origin: (origin, callback) => {
      // Cho phép requests không có origin (như curl hoặc mobile) hoặc match frontendUrl
      if (!origin || origin.includes('localhost') || origin === config.frontendUrl) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive for easy cloud deployment
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// 3. Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 4. Rate limiter chung
app.use('/api', apiLimiter);

// 5. Health check endpoint
app.get('/api/health-check', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'PetCare AI Backend Service đang hoạt động bình thường.',
    timestamp: new Date().toISOString(),
  });
});

// 6. Gắn toàn bộ REST API
app.use('/api', apiRouter);

// 7. Xử lý 404 và ngoại lệ toàn cục
app.use(notFoundHandler);
app.use(errorHandler);
