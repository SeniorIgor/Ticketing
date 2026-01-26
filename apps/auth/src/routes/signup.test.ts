import request from 'supertest';

import { AUTH_COOKIE_NAME } from '@org/core';

import { createApp } from '../app';
import { User } from '../models';

const app = createApp();

describe('POST /api/v1/users/signup', () => {
  const validBody = {
    email: 'test@test.com',
    password: 'Password123_',
  };

  it('creates a user and returns 201', async () => {
    const res = await request(app).post('/api/v1/users/signup').send(validBody).expect(201);

    expect(res.body.email).toBe(validBody.email);
    expect(res.body.password).toBeUndefined();
  });

  it('persists the user in the database', async () => {
    await request(app).post('/api/v1/users/signup').send(validBody).expect(201);

    const user = await User.findOne({ email: validBody.email });
    expect(user).not.toBeNull();
  });

  it('hashes the password', async () => {
    await request(app).post('/api/v1/users/signup').send(validBody).expect(201);

    const user = await User.findOne({ email: validBody.email });

    expect(user).not.toBeNull();
    if (!user) {
      throw new Error('User was not created');
    }

    expect(user.password).not.toBe(validBody.password);
  });

  it('sets auth cookie with correct options', async () => {
    const res = await request(app).post('/api/v1/users/signup').send(validBody).expect(201);

    const cookiesHeader = res.headers['set-cookie'];
    expect(cookiesHeader).toBeDefined();

    const cookies = Array.isArray(cookiesHeader) ? cookiesHeader : [cookiesHeader];

    const authCookie = cookies.find((c) => c.startsWith(`${AUTH_COOKIE_NAME}=`));

    expect(authCookie).toBeDefined();
    expect(authCookie).toContain('HttpOnly');
    expect(authCookie).toContain('Max-Age=1800');
  });

  it('rejects invalid email only (ApiError + details)', async () => {
    const res = await request(app)
      .post('/api/v1/users/signup')
      .send({ email: 'bad', password: 'Password123_' })
      .expect(400);

    expect(res.body).toMatchObject({
      code: 'VALIDATION',
      reason: 'SIGNUP_INVALID_INPUT',
      message: expect.any(String),
      details: expect.arrayContaining([
        expect.objectContaining({
          fieldName: 'email',
          message: expect.any(String),
        }),
      ]),
    });
  });

  it('rejects invalid password only (ApiError + details)', async () => {
    const res = await request(app)
      .post('/api/v1/users/signup')
      .send({ email: 'test@test.com', password: 'password123' })
      .expect(400);

    expect(res.body).toMatchObject({
      code: 'VALIDATION',
      reason: 'SIGNUP_INVALID_INPUT',
      message: expect.any(String),
      details: expect.arrayContaining([
        expect.objectContaining({
          fieldName: 'password',
          message: expect.any(String),
        }),
      ]),
    });
  });

  it('rejects when both fields invalid (two details)', async () => {
    const res = await request(app).post('/api/v1/users/signup').send({ email: 'bad', password: '123' }).expect(400);

    expect(res.body).toMatchObject({
      code: 'VALIDATION',
      reason: 'SIGNUP_INVALID_INPUT',
      message: expect.any(String),
    });

    expect(res.body.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ fieldName: 'email' }),
        expect.objectContaining({ fieldName: 'password' }),
      ]),
    );
  });

  it('rejects duplicate email', async () => {
    await request(app).post('/api/v1/users/signup').send(validBody).expect(201);

    await request(app).post('/api/v1/users/signup').send(validBody).expect(409);
  });
});
