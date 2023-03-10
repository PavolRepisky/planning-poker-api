import express from 'express';
import { checkSchema } from 'express-validator';
import validateSchema from '../../core/middleware/validateSchema';
import authController from '../controllers/authController';
import authenticateUser from '../middleware/authenticateUser';
import loginSchema from '../middleware/loginSchema';
import registerSchema from '../middleware/registerSchema';
import validateEmailIsAvailable from '../middleware/validateEmailIsAvailable';
import validateLoginCredentials from '../middleware/validateLoginCredentials';

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

authRoutes.get(
   '/me',
   [authenticateUser],
   authController.getUser
)

export default authRoutes;
