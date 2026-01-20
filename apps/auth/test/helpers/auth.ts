import request from 'supertest';

import { AUTH_COOKIE_NAME } from '@org/core';

import { createApp } from '../../src/app';

const app = createApp();

export async function signupAndGetAuthCookie(user: { email: string; password: string }): Promise<string> {
  const res = await request(app).post('/api/v1/users/signup').send(user).expect(201);

  const cookiesHeader = res.headers['set-cookie'];
  const cookies = Array.isArray(cookiesHeader) ? cookiesHeader : [cookiesHeader];

  const authCookie = cookies.find((c) => c.startsWith(`${AUTH_COOKIE_NAME}=`));

  if (!authCookie) {
    throw new Error('Auth cookie was not set during signup');
  }

  return authCookie;
}
