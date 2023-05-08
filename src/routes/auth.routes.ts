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
import { validateResetToken } from '../middleware/validateResetToken';
import { validateSchema } from '../middleware/validateSchema';
import { validateVerificationCode } from '../middleware/validateVerificationCode';
import {
  forgotPasswordSchema,
  loginSchema,
  regsiterSchema,
  resetPasswordSchema,
} from '../schemas/auth.schema';

const authRouter = express.Router();

authRouter.post(
  '/register',
  validateSchema(regsiterSchema),
  registerUserHandler
);

authRouter.post('/login', validateSchema(loginSchema), loginUserHandler);

authRouter.get('/refresh', refreshAccessTokenHandler);

authRouter.get('/logout', deserializeUser, requireUser, logoutUserHandler);

authRouter.get(
  '/verify-email/:verificationCode',
  validateVerificationCode,
  verifyEmailHandler
);

authRouter.post(
  '/forgot-password',
  validateSchema(forgotPasswordSchema),
  forgotPasswordHandler
);

authRouter.patch(
  '/reset-password/:resetToken',
  validateResetToken,
  validateSchema(resetPasswordSchema),
  resetPasswordHandler
);

export default authRouter;
