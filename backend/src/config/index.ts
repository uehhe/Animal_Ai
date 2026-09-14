import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:postgrespassword@localhost:5432/petcare_db?schema=public',
  jwtSecret: process.env.JWT_SECRET || 'petcare_super_secret_jwt_key_development_only_123456',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  ai: {
    apiKey: process.env.AI_API_KEY || '',
    model: process.env.AI_MODEL || 'gpt-4o-mini',
    baseUrl: process.env.AI_BASE_URL || 'https://api.openai.com/v1',
  },
};
