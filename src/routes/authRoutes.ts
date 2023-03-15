import express from 'express';
import { checkSchema } from 'express-validator';
import authController from '../controllers/authController';
import authenticateUser from '../middleware/auth/authenticateUser';
import loginSchema from '../middleware/auth/loginSchema';
import registerSchema from '../middleware/auth/registerSchema';
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

authRoutes.get('/me', [authenticateUser], authController.getUser);

export default authRoutes;
