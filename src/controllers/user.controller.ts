import bcrypt from 'bcryptjs';
import config from 'config';
import { NextFunction, Request, Response } from 'express';
import {
  ChangeNameRequestBody,
  ChangePasswordRequestBody,
} from '../schemas/user.schema';
import { updateUser } from '../services/user.service';
import HttpCode from '../types/HttpCode';
import UserData from '../types/UserData';
import USER_UNAUTHORIZED from '../types/errors/UserUnauthorized';

export const getUserHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = res.locals.user;
    const { id, firstName, lastName, email } = user;

    res.status(HttpCode.OK).json({
      message: req.t('user.get.success'),
      data: {
        user: {
          id,
          firstName,
          lastName,
          email,
        } as UserData,
      },
    });
  } catch (err: any) {
    next(err);
  }
};

export const changeNameHandler = async (
  req: Request<{}, {}, ChangeNameRequestBody>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { firstName, lastName } = req.body;
    const { id } = res.locals.user;

    const updatedUser = await updateUser(
      { id },
      { firstName, lastName },
      { id: true, firstName: true, lastName: true, email: true }
    );

    res.status(HttpCode.OK).json({
      message: req.t('user.changeName.success'),
      data: {
        user: {
          id: updatedUser.id,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          email: updatedUser.email,
        } as UserData,
      },
    });
  } catch (err: any) {
    next(err);
  }
};

export const changePasswordHandler = async (
  req: Request<{}, {}, ChangePasswordRequestBody>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = res.locals.user;
    const { password, newPassword } = req.body;

    if (!(await bcrypt.compare(password, user.password))) {
      throw USER_UNAUTHORIZED;
    }

    const hashedNewPassword = await bcrypt.hash(
      newPassword,
      config.get<number>('hashSalt')
    );

    await updateUser({ id: user.id }, { password: hashedNewPassword });

    res.status(HttpCode.OK).json({
      message: req.t('user.changePassword.success'),
    });
  } catch (err: any) {
    next(err);
  }
};
