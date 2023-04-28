import express from 'express';
import {
  forgotPassword,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  resetPassword,
  verifyEmail,
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

authRouter.post('/register', validate(regsiterSchema), registerUser);

authRouter.post('/login', validate(loginSchema), loginUser);

authRouter.get('/refresh', refreshAccessToken);

authRouter.get('/logout', deserializeUser, requireUser, logoutUser);

authRouter.get(
  '/verify-email/:verificationCode',
  validate(verifyEmailSchema),
  verifyEmail
);

authRouter.post(
  '/forgot-password',
  validate(forgotPasswordSchema),
  forgotPassword
);

authRouter.patch(
  '/reset-password/:resetToken',
  validate(resetPasswordSchema),
  resetPassword
);

export default authRouter;
