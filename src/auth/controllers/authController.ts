import { NextFunction, Request, Response } from 'express';
import userService from '../../core/services/userService';
import HttpCode from '../../core/types/httpCode';
import UserInfo from '../../core/types/userInfo';
import USER_NOT_FOUND from '../../core/types/userNotFound';
import authService from '../services/authService';
import signToken from '../utils/signToken';

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
  } catch (error: any) {
    next(error);
  }
};

const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email } = req.body;
    const user = await userService.findUserByEmail(email);

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
  } catch (error: any) {
    next(error);
  }
};

const getUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const decodedToken = res.locals.token;
    const user = await userService.findUserById(decodedToken.userId);

    if (!user) {
      throw USER_NOT_FOUND;
    }

    const { id, firstName, lastName, email } = user;

    res.status(HttpCode.OK).json({
      message: req.t('auth.login.success'),
      data: {
        user: {
          id,
          firstName,
          lastName,
          email,
        } as UserInfo,
      },
    });
  } catch (error: any) {
    next(error);
  }
};

export default { register, login, getUser };
