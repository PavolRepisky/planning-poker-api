import { NextFunction, Request, Response } from 'express';
import userService from '../services/userService';
import HttpCode from '../types/HttpCode';
import USER_NOT_FOUND from '../types/errors/UserNotFound';
import UserData from '../types/user/userData';

const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const decodedToken = res.locals.token;
    const { firstName, lastName } = req.body;

    const updatedUser = await userService.updateName(
      decodedToken.userId,
      firstName,
      lastName
    );

    if (!updatedUser) {
      throw USER_NOT_FOUND;
    }

    res.status(HttpCode.OK).json({
      message: req.t('user.nameUpdate.success'),
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

const updatePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const decodedToken = res.locals.token;
    const { newPassword } = req.body;

    // await userService.updatePassword(decodedToken.userId, newPassword);

    res.status(HttpCode.OK).json({
      message: req.t('user.passwordUpdate.success'),
    });
  } catch (err: any) {
    next(err);
  }
};

export default { updateProfile, updatePassword };
