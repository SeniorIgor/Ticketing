import type { Request, Response } from 'express';
import express from 'express';

import { asyncHandler, BusinessRuleError, signJwt, type SignupReqBody, ValidationError } from '@org/core';

import { User } from '../models';
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

    res.cookie('auth', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/',
      maxAge: 1000 * 60 * 15,
    });

    res.status(201).send(user);
  }),
);

export { router as signupRouter };

// throw new InternalError(
//   'DATABASE_UNAVAILABLE',
//   'Database is temporarily unavailable',
// );

// throw new BusinessRuleError(
//   'USER_ALREADY_EXISTS',
//   'User with this email already exists',
// );
