import express from 'express';
import { getUser } from '../controllers/user.controller';
import { deserializeUser } from '../middleware/deserializeUser';
import { requireUser } from '../middleware/requireUser';

const userRouter = express.Router();

userRouter.use(deserializeUser, requireUser);

userRouter.get('/', getUser);

export default userRouter;
