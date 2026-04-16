import request from 'supertest';

import { AUTH_COOKIE_NAME, REFRESH_COOKIE_NAME } from '@org/core';

import { createApp } from '../../app';
import { signupAndGetAuthCookie } from '../../test/helpers';

const app = createApp();

describe('POST /api/v1/users/refresh', () => {
  const validUser = {
    email: 'test@test.com',
    password: 'Password123_',
  };

  it('issues a fresh access cookie and keeps the refresh session valid when refresh token is valid', async () => {
    const authCookies = await signupAndGetAuthCookie(app, validUser);
    const refreshCookie = authCookies.find((cookie) => cookie.startsWith(`${REFRESH_COOKIE_NAME}=`));

    if (!refreshCookie) {
      throw new Error('Refresh cookie was not set');
    }

    const res = await request(app).post('/api/v1/users/refresh').set('Cookie', refreshCookie).expect(200);

    expect(res.body).toEqual({
      currentUser: {
        id: expect.any(String),
        email: validUser.email,
      },
    });

    const cookiesHeader = res.headers['set-cookie'];
    const cookies = Array.isArray(cookiesHeader) ? cookiesHeader : [cookiesHeader];

    const nextAuthCookie = cookies.find((cookie) => cookie.startsWith(`${AUTH_COOKIE_NAME}=`));
    const nextRefreshCookie = cookies.find((cookie) => cookie.startsWith(`${REFRESH_COOKIE_NAME}=`));

    expect(nextAuthCookie).toBeDefined();
    expect(nextRefreshCookie).toBeDefined();
    expect(nextRefreshCookie).toContain('Max-Age=2592000');
  });

  it('rejects refresh when cookie is missing', async () => {
    const res = await request(app).post('/api/v1/users/refresh').expect(401);

    expect(res.body).toMatchObject({
      code: 'AUTHENTICATION',
      reason: 'INVALID_REFRESH_TOKEN',
      message: expect.any(String),
    });
  });

  it('rejects refresh when cookie is invalid', async () => {
    const res = await request(app)
      .post('/api/v1/users/refresh')
      .set('Cookie', `${REFRESH_COOKIE_NAME}=invalid-refresh-token`)
      .expect(401);

    expect(res.body).toMatchObject({
      code: 'AUTHENTICATION',
      reason: 'INVALID_REFRESH_TOKEN',
      message: expect.any(String),
    });

    const cookiesHeader = res.headers['set-cookie'];
    const cookies = Array.isArray(cookiesHeader) ? cookiesHeader : [cookiesHeader];

    expect(cookies.find((cookie) => cookie.startsWith(`${AUTH_COOKIE_NAME}=`))).toBeDefined();
    expect(cookies.find((cookie) => cookie.startsWith(`${REFRESH_COOKIE_NAME}=`))).toBeDefined();
  });
});
