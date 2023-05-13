import express from 'express';
import {
  changeNameHandler,
  changePasswordHandler,
  getUserHandler,
} from '../controllers/user.controller';
import { deserializeUser } from '../middleware/deserializeUser';
import { requireUser } from '../middleware/requireUser';
import { validateSchema } from '../middleware/validateSchema';
import { changeNameSchema, changePasswordSchema } from '../schemas/user.schema';

const userRouter = express.Router();

userRouter.use(deserializeUser, requireUser);

userRouter.get('/', getUserHandler);

userRouter.patch('/name', validateSchema(changeNameSchema), changeNameHandler);

userRouter.patch(
  '/password',
  validateSchema(changePasswordSchema),
  changePasswordHandler
);

export default userRouter;
