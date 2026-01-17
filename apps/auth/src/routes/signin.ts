import type { Request, Response } from 'express';
import express from 'express';

import {
  asyncHandler,
  AUTH_COOKIE_NAME,
  AUTH_COOKIE_OPTIONS,
  AuthenticationError,
  comparePassword,
  signJwt,
  ValidationError,
} from '@org/core';

import { User } from '../models';
import type { SigninReqBody } from '../types';
import { validateSignin } from '../utils';

const router = express.Router();

router.post(
  '/signin',
  asyncHandler(async (req: Request<unknown, unknown, SigninReqBody>, res: Response) => {
    const errors = validateSignin(req.body);

    if (errors.length > 0) {
      throw new ValidationError('SIGNIN_INVALID_INPUT', errors);
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      throw new AuthenticationError('INVALID_CREDENTIALS', 'Invalid email or password');
    }

    const passwordValid = await comparePassword(password, user.password);

    if (!passwordValid) {
      throw new AuthenticationError('INVALID_CREDENTIALS', 'Invalid email or password');
    }

    const token = signJwt({ userId: user.id, email: user.email });

    res.cookie(AUTH_COOKIE_NAME, token, {
      ...AUTH_COOKIE_OPTIONS,
      maxAge: 1000 * 60 * 15,
    });

    res.status(200).send(user);
  }),
);

export { router as signinRouter };
