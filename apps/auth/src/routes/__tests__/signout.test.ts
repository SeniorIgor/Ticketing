import request from 'supertest';

import { AUTH_COOKIE_NAME, REFRESH_COOKIE_NAME } from '@org/core';

import { createApp } from '../../app';
import { signupAndGetAuthCookie } from '../../test/helpers';

const app = createApp();

describe('POST /api/v1/users/signout', () => {
  const validUser = {
    email: 'test@test.com',
    password: 'Password123_',
  };

  let authCookies: string[];

  beforeEach(async () => {
    authCookies = await signupAndGetAuthCookie(app, validUser);
  });

  it('clears access and refresh cookies and returns 204', async () => {
    const res = await request(app).post('/api/v1/users/signout').set('Cookie', authCookies).expect(204);

    const cookiesHeader = res.headers['set-cookie'];
    expect(cookiesHeader).toBeDefined();

    const cookies = Array.isArray(cookiesHeader) ? cookiesHeader : [cookiesHeader];

    const clearedAuthCookie = cookies.find((c) => c.startsWith(`${AUTH_COOKIE_NAME}=`));
    const clearedRefreshCookie = cookies.find((c) => c.startsWith(`${REFRESH_COOKIE_NAME}=`));

    expect(clearedAuthCookie).toBeDefined();
    expect(clearedRefreshCookie).toBeDefined();

    // cleared cookie = empty value + immediate expiration
    expect(clearedAuthCookie).toMatch(new RegExp(`^${AUTH_COOKIE_NAME}=;`));
    expect(clearedAuthCookie).toMatch(/Max-Age=0|Expires=/);
    expect(clearedRefreshCookie).toMatch(new RegExp(`^${REFRESH_COOKIE_NAME}=;`));
    expect(clearedRefreshCookie).toMatch(/Max-Age=0|Expires=/);
  });

  it('is idempotent (works even if cookie is missing)', async () => {
    await request(app).post('/api/v1/users/signout').expect(204);
  });
});
