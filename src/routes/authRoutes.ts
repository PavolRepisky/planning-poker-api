import express from 'express';
import { checkSchema } from 'express-validator';
import authController from '../controllers/authController';
import loginSchema from '../middleware/auth/loginSchema';
import registerSchema from '../middleware/auth/registerSchema';
import userAuthentication from '../middleware/auth/userAuthentication';
import validateEmailIsAvailable from '../middleware/auth/validateEmailIsAvailable';
import validateLoginCredentials from '../middleware/auth/validateLoginCredentials';
import validateSchema from '../middleware/core/validateSchema';

const authRoutes = express.Router();

authRoutes.post(
  '/register',
  [validateSchema(checkSchema(registerSchema)), validateEmailIsAvailable],
  authController.register
);

authRoutes.post(
  '/login',
  [validateSchema(checkSchema(loginSchema)), validateLoginCredentials],
  authController.login
);

authRoutes.get('/me', [userAuthentication.authenticate], authController.getUser);

export default authRoutes;
