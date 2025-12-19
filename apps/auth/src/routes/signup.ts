import type { Request, Response } from 'express';
import express from 'express';

import { type SignupReqBody, ValidationError } from '@org/core';

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

  // registration logic

  return res.status(201).json({ success: true });
});

export { router as signupRouter };
