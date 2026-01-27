import request from 'supertest';

import { AUTH_COOKIE_NAME } from '@org/core';
import { signupAndGetAuthCookie } from '@org/test-utils';

import { createApp } from '../../app';

const app = createApp();

describe('POST /api/v1/users/signout', () => {
  const validUser = {
    email: 'test@test.com',
    password: 'Password123_',
  };

  let authCookie: string;

  beforeEach(async () => {
    authCookie = await signupAndGetAuthCookie(app, validUser);
  });

  it('clears auth cookie and returns 204', async () => {
    const res = await request(app).post('/api/v1/users/signout').set('Cookie', authCookie).expect(204);

    const cookiesHeader = res.headers['set-cookie'];
    expect(cookiesHeader).toBeDefined();

    const cookies = Array.isArray(cookiesHeader) ? cookiesHeader : [cookiesHeader];

    const clearedCookie = cookies.find((c) => c.startsWith(`${AUTH_COOKIE_NAME}=`));

    expect(clearedCookie).toBeDefined();

    // cleared cookie = empty value + immediate expiration
    expect(clearedCookie).toMatch(new RegExp(`^${AUTH_COOKIE_NAME}=;`));
    expect(clearedCookie).toMatch(/Max-Age=0|Expires=/);
  });

  it('is idempotent (works even if cookie is missing)', async () => {
    await request(app).post('/api/v1/users/signout').expect(204);
  });
});
