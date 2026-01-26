import request from 'supertest';

import { AUTH_COOKIE_NAME } from '@org/core';

import { createApp } from '../app';

const app = createApp();

describe('POST /api/v1/users/signin', () => {
  const validUser = {
    email: 'test@test.com',
    password: 'Password123_',
  };

  beforeEach(async () => {
    // create user via signup to ensure password hashing is realistic
    await request(app).post('/api/v1/users/signup').send(validUser).expect(201);
  });

  it('signs in user and returns 200', async () => {
    const res = await request(app).post('/api/v1/users/signin').send(validUser).expect(200);

    expect(res.body.email).toBe(validUser.email);
    expect(res.body.password).toBeUndefined();
  });

  it('sets auth cookie', async () => {
    const res = await request(app).post('/api/v1/users/signin').send(validUser).expect(200);

    const cookiesHeader = res.headers['set-cookie'];
    expect(cookiesHeader).toBeDefined();

    const cookies = Array.isArray(cookiesHeader) ? cookiesHeader : [cookiesHeader];
    const authCookie = cookies.find((c) => c.startsWith(`${AUTH_COOKIE_NAME}=`));

    expect(authCookie).toBeDefined();
    expect(authCookie).toContain('HttpOnly');
    expect(authCookie).toContain('Max-Age=1800');
  });

  it('rejects invalid input (validation error)', async () => {
    const res = await request(app).post('/api/v1/users/signin').send({ email: 'bad', password: '123' }).expect(400);

    expect(res.body).toMatchObject({
      code: 'VALIDATION',
      reason: 'SIGNIN_INVALID_INPUT',
      message: expect.any(String),
      details: expect.any(Array),
    });
  });

  it('rejects when user does not exist', async () => {
    const res = await request(app)
      .post('/api/v1/users/signin')
      .send({ email: 'missing@test.com', password: 'Password123_' })
      .expect(401);

    expect(res.body).toMatchObject({
      code: 'AUTHENTICATION',
      reason: 'INVALID_CREDENTIALS',
      message: expect.any(String),
    });
  });

  it('rejects when password is incorrect', async () => {
    const res = await request(app)
      .post('/api/v1/users/signin')
      .send({ email: validUser.email, password: 'WrongPassword123_' })
      .expect(401);

    expect(res.body).toMatchObject({
      code: 'AUTHENTICATION',
      reason: 'INVALID_CREDENTIALS',
      message: expect.any(String),
    });
  });
});
