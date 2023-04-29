import express from 'express';
import {
  forgotPasswordHandler,
  loginUserHandler,
  logoutUserHandler,
  refreshAccessTokenHandler,
  registerUserHandler,
  resetPasswordHandler,
  verifyEmailHandler,
} from '../controllers/auth.controller';
import { deserializeUser } from '../middleware/deserializeUser';
import { requireUser } from '../middleware/requireUser';
import { validate } from '../middleware/validate';
import {
  forgotPasswordSchema,
  loginSchema,
  regsiterSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from '../schemas/auth.schema';

const authRouter = express.Router();

authRouter.post('/register', validate(regsiterSchema), registerUserHandler);

authRouter.post('/login', validate(loginSchema), loginUserHandler);

authRouter.get('/refresh', refreshAccessTokenHandler);

authRouter.get('/logout', deserializeUser, requireUser, logoutUserHandler);

authRouter.get(
  '/verify-email/:verificationCode',
  validate(verifyEmailSchema),
  verifyEmailHandler
);

authRouter.post(
  '/forgot-password',
  validate(forgotPasswordSchema),
  forgotPasswordHandler
);

authRouter.patch(
  '/reset-password/:resetToken',
  validate(resetPasswordSchema),
  resetPasswordHandler
);

export default authRouter;