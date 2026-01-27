import { AUTH_COOKIE_NAME, signJwt } from '@org/core';

export function getAuthCookie(user?: { userId: string; email: string }): string {
  const payload = user ?? { userId: 'test-user-id', email: 'test@test.com' };
  const token = signJwt(payload);

  return `${AUTH_COOKIE_NAME}=${token}`;
}
