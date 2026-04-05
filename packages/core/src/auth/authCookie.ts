import type { CookieOptions } from 'express';

export const AUTH_COOKIE_NAME = 'auth';
export const AUTH_COOKIE_MAX_AGE = 1000 * 60 * 15;
export const REFRESH_COOKIE_NAME = 'refresh';
export const REFRESH_COOKIE_MAX_AGE = 1000 * 60 * 60 * 24 * 30;

export const AUTH_COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  path: '/',
};

export const REFRESH_COOKIE_OPTIONS: CookieOptions = {
  ...AUTH_COOKIE_OPTIONS,
};
