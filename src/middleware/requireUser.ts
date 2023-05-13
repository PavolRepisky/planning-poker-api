import { NextFunction, Request, Response } from 'express';
import USER_UNAUTHORIZED from '../types/errors/UserUnauthorized';

export const requireUser = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const user = res.locals.user;

  if (!user) {
    return next(USER_UNAUTHORIZED);
  }
  next();
};
