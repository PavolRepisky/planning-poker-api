import { NextFunction, Request, Response } from 'express';
import authService from '../services/authService';
import userService from '../services/userService';
import HttpCode from '../types/core/httpCode';
import UserInfo from '../types/core/userInfo';
import USER_NOT_FOUND from '../types/core/userNotFound';
import signToken from '../utils/auth/signToken';

const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { firstName, lastName, email, password } = req.body;
    await authService.createUser(firstName, lastName, email, password);

    res.status(HttpCode.CREATED).json({
      message: req.t('auth.register.success'),
    });
  } catch (err: any) {
    next(err);
  }
};

const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email } = req.body;
    const user = await userService.findByEmail(email);

    if (!user) {
      throw USER_NOT_FOUND;
    }

    const token = signToken(user.email, user.id);

    res.status(HttpCode.OK).json({
      message: req.t('auth.login.success'),
      data: {
        token,
      },
    });
  } catch (err: any) {
    next(err);
  }
};

const getUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const decodedToken = res.locals.token;
    const user = await userService.findById(decodedToken.userId);

    if (!user) {
      throw USER_NOT_FOUND;
    }

    const { id, firstName, lastName, email } = user;

    res.status(HttpCode.OK).json({
      message: req.t('auth.getUser.success'),
      data: {
        user: {
          id,
          firstName,
          lastName,
          email,
        } as UserInfo,
      },
    });
  } catch (err: any) {
    next(err);
  }
};

export default { register, login, getUser };
