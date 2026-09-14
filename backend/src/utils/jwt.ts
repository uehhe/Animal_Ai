import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../config/index.js';
import { AuthTokenPayload } from '../types/index.js';

export const generateToken = (payload: AuthTokenPayload): string => {
  const options: SignOptions = {
    expiresIn: config.jwtExpiresIn as unknown as number,
  };
  return jwt.sign(payload, config.jwtSecret, options);
};

export const verifyToken = (token: string): AuthTokenPayload => {
  return jwt.verify(token, config.jwtSecret) as AuthTokenPayload;
};
