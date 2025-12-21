import type { Request, Response } from 'express';
import express from 'express';

import { InternalError, type SignupReqBody, ValidationError } from '@org/core';

import { validateSignup } from '../utils';

const router = express.Router();

router.post('/signup', (req: Request<unknown, unknown, SignupReqBody>, res: Response) => {
  const errors = validateSignup(req.body);

  if (Object.keys(errors).length > 0) {
    throw new ValidationError(
      'SIGNUP_INVALID_INPUT',
      Object.entries(errors).map(([field, err]) => ({
        fieldName: field,
        message: err.message,
      })),
    );
  }

  throw new InternalError('DATABASE_UNAVAILABLE', 'Database is temporarily unavailable');

  // return res.status(201).json({ success: true });
});

export { router as signupRouter };

// throw new InternalError(
//   'DATABASE_UNAVAILABLE',
//   'Database is temporarily unavailable',
// );

// throw new BusinessRuleError(
//   'USER_ALREADY_EXISTS',
//   'User with this email already exists',
// );
