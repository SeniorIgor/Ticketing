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

  it('rejects request when not authenticated', async () => {
    const res = await request(app).get('/api/v1/users/current-user').expect(401);

    expect(res.body).toMatchObject({
      code: 'AUTHENTICATION',
      reason: 'NOT_AUTHENTICATED',
      message: expect.any(String),
    });
  });

  it('rejects request with invalid token', async () => {
    const res = await request(app)
      .get('/api/v1/users/current-user')
      .set('Cookie', `${AUTH_COOKIE_NAME}=invalid-token`)
      .expect(401);

    expect(res.body).toMatchObject({
      code: 'AUTHENTICATION',
      reason: 'INVALID_TOKEN',
      message: expect.any(String),
    });
  });
});
