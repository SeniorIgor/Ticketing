import { Router } from 'express';

import { currentUserRouter } from './current-user';
import { signinRouter } from './signin';
import { signoutRouter } from './signout';
import { signupRouter } from './signup';

const router = Router();

router.use(currentUserRouter);
router.use(signinRouter);
router.use(signupRouter);
router.use(signoutRouter);

export { router as usersRouter };
