import request from 'supertest';

import { AUTH_COOKIE_NAME } from '@org/core';

import { createApp } from '../app';

const app = createApp();

describe('POST /api/v1/users/signout', () => {
  const validUser = {
    email: 'test@test.com',
    password: 'Password123_',
  };

  let authCookie: string;

  beforeEach(async () => {
    const res = await request(app).post('/api/v1/users/signup').send(validUser).expect(201);

    const cookiesHeader = res.headers['set-cookie'];
    const cookies = Array.isArray(cookiesHeader) ? cookiesHeader : [cookiesHeader];

    const found = cookies.find((c) => c.startsWith(`${AUTH_COOKIE_NAME}=`));

    if (!found) {
      throw new Error('Auth cookie was not set during signup');
    }

    authCookie = found;
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
