import express from 'express';
import {
  changeNameHandler,
  changePasswordHandler,
  getUserHandler,
} from '../controllers/user.controller';
import { deserializeUser } from '../middleware/deserializeUser';
import { requireUser } from '../middleware/requireUser';
import { validate } from '../middleware/validate';
import { changeNameSchema, changePasswordSchema } from '../schemas/user.schema';

const userRouter = express.Router();

userRouter.use(deserializeUser, requireUser);

userRouter.get('/', getUserHandler);

userRouter.patch('/name', validate(changeNameSchema), changeNameHandler);

userRouter.patch(
  '/password',
  validate(changePasswordSchema),
  changePasswordHandler
);

export default userRouter;
