import type { CookieOptions } from 'express';

export const AUTH_COOKIE_NAME = 'auth';

export const AUTH_COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  path: '/',
};
