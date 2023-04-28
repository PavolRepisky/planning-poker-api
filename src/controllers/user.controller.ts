import { NextFunction, Request, Response } from 'express';
import HttpCode from '../types/HttpCode';

export const getUser = async (
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
        },
      },
    });
  } catch (err: any) {
    next(err);
  }
};
