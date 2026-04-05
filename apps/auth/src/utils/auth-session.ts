import crypto from 'crypto';
import type { Response } from 'express';

import {
  AUTH_COOKIE_MAX_AGE,
  AUTH_COOKIE_NAME,
  AUTH_COOKIE_OPTIONS,
  REFRESH_COOKIE_MAX_AGE,
  REFRESH_COOKIE_NAME,
  REFRESH_COOKIE_OPTIONS,
  signJwt,
} from '@org/core';

import { RefreshSession, User } from '../models';

type AuthenticatedUser = {
  id: string;
  email: string;
};

type SessionTokens = {
  accessToken: string;
  refreshToken: string;
};

type IssuedSession = SessionTokens & {
  user: AuthenticatedUser;
};

function buildRefreshSessionExpiry() {
  return new Date(Date.now() + REFRESH_COOKIE_MAX_AGE);
}

function buildAccessToken(user: AuthenticatedUser) {
  return signJwt({
    userId: user.id,
    email: user.email,
  });
}

function generateRefreshToken() {
  return crypto.randomBytes(48).toString('base64url');
}

function hashRefreshToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function setAuthCookies(res: Response, tokens: SessionTokens) {
  res.cookie(AUTH_COOKIE_NAME, tokens.accessToken, {
    ...AUTH_COOKIE_OPTIONS,
    maxAge: AUTH_COOKIE_MAX_AGE,
  });

  res.cookie(REFRESH_COOKIE_NAME, tokens.refreshToken, {
    ...REFRESH_COOKIE_OPTIONS,
    maxAge: REFRESH_COOKIE_MAX_AGE,
  });
}

export function clearAuthCookies(res: Response) {
  res.clearCookie(AUTH_COOKIE_NAME, AUTH_COOKIE_OPTIONS);
  res.clearCookie(REFRESH_COOKIE_NAME, REFRESH_COOKIE_OPTIONS);
}

export function serializeAuthenticatedUser(user: { id: string; email: string }): AuthenticatedUser {
  return {
    id: user.id,
    email: user.email,
  };
}

export async function issueSessionForUser(user: { id: string; email: string }): Promise<IssuedSession> {
  const authenticatedUser = serializeAuthenticatedUser(user);
  const refreshToken = generateRefreshToken();

  await RefreshSession.create({
    user: authenticatedUser.id,
    tokenHash: hashRefreshToken(refreshToken),
    expiresAt: buildRefreshSessionExpiry(),
  });

  return {
    user: authenticatedUser,
    accessToken: buildAccessToken(authenticatedUser),
    refreshToken,
  };
}

export async function refreshSession(refreshToken: string): Promise<IssuedSession | null> {
  const refreshedSession = await RefreshSession.findOneAndUpdate(
    {
      tokenHash: hashRefreshToken(refreshToken),
      expiresAt: { $gt: new Date() },
    },
    {
      $set: {
        expiresAt: buildRefreshSessionExpiry(),
      },
    },
    { new: true },
  );

  if (!refreshedSession) {
    return null;
  }

  const user = await User.findById(refreshedSession.user);

  if (!user) {
    await RefreshSession.deleteOne({ _id: refreshedSession._id });
    return null;
  }

  const authenticatedUser = serializeAuthenticatedUser(user);

  return {
    user: authenticatedUser,
    accessToken: buildAccessToken(authenticatedUser),
    refreshToken,
  };
}

export async function revokeRefreshSession(refreshToken?: string | null) {
  if (!refreshToken) {
    return;
  }

  await RefreshSession.deleteOne({
    tokenHash: hashRefreshToken(refreshToken),
  });
}
