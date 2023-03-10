import express from 'express';
import { checkSchema } from 'express-validator';
import authenticateUser from '../../auth/middleware/authenticateUser';
import validateSchema from '../../core/middleware/validateSchema';
import userController from '../controllers/userController';
import nameUpdateSchema from '../middleware/nameUpdateSchema';
import passwordUpdateSchema from '../middleware/passwordUpdateSchema';
import validatePassword from '../middleware/validatePassword';

const userRoutes = express.Router();

userRoutes.patch(
  '/user/name',
  [authenticateUser, validateSchema(checkSchema(nameUpdateSchema))],
  userController.updateName
);

userRoutes.patch(
  '/user/password',
  [
    authenticateUser,
    validateSchema(checkSchema(passwordUpdateSchema)),
    validatePassword,
  ],
  userController.updatePassword
);

export default userRoutes;
