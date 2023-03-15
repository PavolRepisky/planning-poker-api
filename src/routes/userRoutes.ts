import express from 'express';
import { checkSchema } from 'express-validator';
import userController from '../controllers/userController';
import authenticateUser from '../middleware/auth/authenticateUser';
import validateSchema from '../middleware/core/validateSchema';
import nameUpdateSchema from '../types/user/nameUpdateSchema';
import passwordUpdateSchema from '../types/user/passwordUpdateSchema';
import validatePassword from '../types/user/validatePassword';

const userRoutes = express.Router();

userRoutes.patch(
  '/name',
  [authenticateUser, validateSchema(checkSchema(nameUpdateSchema))],
  userController.updateName
);

userRoutes.patch(
  '/password',
  [
    authenticateUser,
    validateSchema(checkSchema(passwordUpdateSchema)),
    validatePassword,
  ],
  userController.updatePassword
);

export default userRoutes;
