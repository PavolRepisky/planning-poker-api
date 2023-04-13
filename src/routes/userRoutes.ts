import express from 'express';
import { checkSchema } from 'express-validator';
import userController from '../controllers/userController';
import userAuthentication from '../middleware/auth/userAuthentication';
import validateSchema from '../middleware/core/validateSchema';
import updatePasswordSchema from '../middleware/user/updatePasswordSchema';
import updateProfileSchema from '../middleware/user/updateProfileSchema';
import validatePassword from '../middleware/user/validatePassword';

const userRoutes = express.Router();

userRoutes.patch(
  '/profile',
  [
    userAuthentication.authenticate,
    validateSchema(checkSchema(updateProfileSchema)),
  ],
  userController.updateProfile
);

userRoutes.patch(
  '/password',
  [
    userAuthentication.authenticate,
    validateSchema(checkSchema(updatePasswordSchema)),
    validatePassword,
  ],
  userController.updatePassword
);

export default userRoutes;
