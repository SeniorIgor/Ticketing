import type { Request, Response } from 'express';
import express from 'express';

import {
  asyncHandler,
  AUTH_COOKIE_MAX_AGE,
  AUTH_COOKIE_NAME,
  AUTH_COOKIE_OPTIONS,
  BusinessRuleError,
  signJwt,
  ValidationError,
} from '@org/core';

import { User } from '../models';
import type { SignupReqBody } from '../types';
import { validateSignup } from '../utils';

const router = express.Router();

router.post(
  '/signup',
  asyncHandler(async (req: Request<unknown, unknown, SignupReqBody>, res: Response) => {
    const errors = validateSignup(req.body);

    if (errors.length > 0) {
      throw new ValidationError('SIGNUP_INVALID_INPUT', errors);
    }

    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw new BusinessRuleError('USER_ALREADY_EXISTS', 'User with this email already exists');
    }

    const user = User.build({ email, password });
    await user.save();

    const token = signJwt({ userId: user.id, email: user.email });

    res.cookie(AUTH_COOKIE_NAME, token, {
      ...AUTH_COOKIE_OPTIONS,
      maxAge: AUTH_COOKIE_MAX_AGE,
    });

    res.status(201).send(user);
  }),
);

export { router as signupRouter };
