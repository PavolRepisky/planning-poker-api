import express from 'express';
import {
  changeName,
  changePassword,
  getUser,
} from '../controllers/user.controller';
import { deserializeUser } from '../middleware/deserializeUser';
import { requireUser } from '../middleware/requireUser';
import { validate } from '../middleware/validate';
import { changeNameSchema, changePasswordSchema } from '../schemas/user.schema';

const userRouter = express.Router();

userRouter.use(deserializeUser, requireUser);

userRouter.get('/', getUser);

userRouter.patch('/name', validate(changeNameSchema), changeName);

userRouter.patch('/password', validate(changePasswordSchema), changePassword);

export default userRouter;
