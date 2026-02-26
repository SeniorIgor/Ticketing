import request from 'supertest';

import { AUTH_COOKIE_NAME } from '@org/core';

import { createApp } from '../../app';
import { signupAndGetAuthCookie } from '../../test/helpers';

const app = createApp();

describe('GET /api/v1/users/current-user', () => {
  const validUser = {
    email: 'test@test.com',
    password: 'Password123_',
  };

  let authCookie: string;

  beforeEach(async () => {
    authCookie = await signupAndGetAuthCookie(app, validUser);
  });

  it('returns current user when authenticated', async () => {
    const res = await request(app).get('/api/v1/users/current-user').set('Cookie', authCookie).expect(200);

    expect(res.body).toEqual({
      currentUser: {
        email: validUser.email,
        userId: expect.any(String),
      },
    });
  });

  it('returns currentUser: null when not authenticated', async () => {
    const res = await request(app).get('/api/v1/users/current-user').expect(200);

    expect(res.body).toEqual({ currentUser: null });
  });

  it('returns currentUser: null and clears cookie when token is invalid/outdated', async () => {
    const res = await request(app)
      .get('/api/v1/users/current-user')
      .set('Cookie', `${AUTH_COOKIE_NAME}=invalid-token`)
      .expect(200);

    expect(res.body).toEqual({ currentUser: null });

    // Ensure cookie was cleared
    const setCookie = res.headers['set-cookie'];
    expect(setCookie).toBeDefined();

    const cookies = Array.isArray(setCookie) ? setCookie : [setCookie];

    const cleared = cookies.find((c) => c.startsWith(`${AUTH_COOKIE_NAME}=`));
    expect(cleared).toBeDefined();

    // Typical clearCookie results include Max-Age=0 or Expires in the past.
    expect(cleared).toMatch(/Max-Age=0|Expires=/);
  });
});
