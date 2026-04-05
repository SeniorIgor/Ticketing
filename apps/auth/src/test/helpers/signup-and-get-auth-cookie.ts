import type { Application } from 'express';
import request from 'supertest';

import { AUTH_COOKIE_NAME, REFRESH_COOKIE_NAME } from '@org/core';

import type { User } from '../../types';

export async function signupAndGetAuthCookie(app: Application, user: User): Promise<string[]> {
  const res = await request(app).post('/api/v1/users/signup').send(user).expect(201);

  const cookiesHeader = res.headers['set-cookie'];
  const cookies = Array.isArray(cookiesHeader) ? cookiesHeader : [cookiesHeader];

  const authCookie = cookies.find((c) => c.startsWith(`${AUTH_COOKIE_NAME}=`));
  const refreshCookie = cookies.find((c) => c.startsWith(`${REFRESH_COOKIE_NAME}=`));

  if (!authCookie || !refreshCookie) {
    throw new Error('Authentication cookies were not set');
  }

  return [authCookie, refreshCookie];
}
