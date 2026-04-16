import request from 'supertest';

import { AUTH_COOKIE_NAME, REFRESH_COOKIE_NAME } from '@org/core';

import { createApp } from '../../app';
import { User } from '../../models';
import { signupAndGetAuthCookie } from '../../test/helpers';

const app = createApp();

describe('GET /api/v1/users/current-user', () => {
  const validUser = {
    email: 'test@test.com',
    password: 'Password123_',
  };

  let authCookies: string[];

  beforeEach(async () => {
    authCookies = await signupAndGetAuthCookie(app, validUser);
  });

  it('returns current user when authenticated', async () => {
    const res = await request(app).get('/api/v1/users/current-user').set('Cookie', authCookies).expect(200);

    expect(res.body).toEqual({
      currentUser: {
        email: validUser.email,
        id: expect.any(String),
      },
    });
  });

  it('returns currentUser: null when not authenticated', async () => {
    const res = await request(app).get('/api/v1/users/current-user').expect(200);

    expect(res.body).toEqual({ currentUser: null });
  });

  it('returns 401 and clears access cookie when token is invalid/outdated', async () => {
    const res = await request(app)
      .get('/api/v1/users/current-user')
      .set('Cookie', `${AUTH_COOKIE_NAME}=invalid-token`)
      .expect(401);

    expect(res.body).toMatchObject({
      code: 'AUTHENTICATION',
      reason: 'INVALID_TOKEN',
      message: expect.any(String),
    });

    // Ensure cookie was cleared
    const setCookie = res.headers['set-cookie'];
    expect(setCookie).toBeDefined();

    const cookies = Array.isArray(setCookie) ? setCookie : [setCookie];

    const cleared = cookies.find((c) => c.startsWith(`${AUTH_COOKIE_NAME}=`));
    expect(cleared).toBeDefined();
    expect(cleared).toMatch(/Max-Age=0|Expires=/);
  });

  it('returns 401 when only refresh cookie remains', async () => {
    const refreshCookie = authCookies.find((cookie) => cookie.startsWith(`${REFRESH_COOKIE_NAME}=`));

    if (!refreshCookie) {
      throw new Error('Refresh cookie was not set');
    }

    const res = await request(app).get('/api/v1/users/current-user').set('Cookie', refreshCookie).expect(401);

    expect(res.body).toMatchObject({
      code: 'AUTHENTICATION',
      reason: 'ACCESS_TOKEN_MISSING',
      message: expect.any(String),
    });
  });

  it('returns 401 and clears cookies when the user behind the token no longer exists', async () => {
    const currentUserRes = await request(app).get('/api/v1/users/current-user').set('Cookie', authCookies).expect(200);
    await User.deleteOne({ _id: currentUserRes.body.currentUser.id });

    const res = await request(app).get('/api/v1/users/current-user').set('Cookie', authCookies).expect(401);

    expect(res.body).toMatchObject({
      code: 'AUTHENTICATION',
      reason: 'INVALID_TOKEN',
      message: expect.any(String),
    });

    const setCookie = res.headers['set-cookie'];
    const cookies = Array.isArray(setCookie) ? setCookie : [setCookie];

    expect(cookies.find((c) => c.startsWith(`${AUTH_COOKIE_NAME}=`))).toBeDefined();
    expect(cookies.find((c) => c.startsWith(`${REFRESH_COOKIE_NAME}=`))).toBeDefined();
  });
});
