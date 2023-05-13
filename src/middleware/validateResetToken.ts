import crypto from 'crypto';
import { NextFunction, Request, Response } from 'express';
import { findUser } from '../services/user.service';
import ROUTE_NOT_FOUND from '../types/errors/RouteNotFound';

export const validateResetToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const passwordResetToken = crypto
      .createHash('sha256')
      .update(req.params.resetToken)
      .digest('hex');

    const user = await findUser({
      passwordResetToken,
      passwordResetAt: {
        gt: new Date(),
      },
    });

    if (!user) {
      throw ROUTE_NOT_FOUND;
    }

    res.locals.user = user;
    next();
  } catch (err) {
    next(err);
  }
};
