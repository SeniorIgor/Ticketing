import type { JwtPayload } from 'jsonwebtoken';
import jwt from 'jsonwebtoken';

import { AuthenticationError } from '../errors';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined');
}

export interface AuthJwtPayload extends JwtPayload {
  userId: string;
  email: string;
}

export const signJwt = (payload: AuthJwtPayload, options?: jwt.SignOptions): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '15M',
    algorithm: 'HS256',
    ...options,
  });
};

export const verifyJwt = (token: string): AuthJwtPayload => {
  const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

  if (!decoded || typeof decoded !== 'object' || !decoded.userId) {
    throw new AuthenticationError('INVALID_TOKEN', 'Authentication token is invalid or expired');
  }

  return {
    userId: decoded.userId as string,
    email: decoded.email as string,
  };
};
