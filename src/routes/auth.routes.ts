import express from 'express';
import {
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  verifyEmail,
} from '../controllers/auth.controller';
import { deserializeUser } from '../middleware/deserializeUser';
import { requireUser } from '../middleware/requireUser';
import { validate } from '../middleware/validate';
import {
  loginSchema,
  regsiterSchema,
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

export default authRouter;
