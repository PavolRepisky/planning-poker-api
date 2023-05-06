import { NextFunction, Request, Response } from 'express';
import { findUniqueUser } from '../services/user.service';
import ROUTE_NOT_FOUND from '../types/errors/RouteNotFound';

export const validateVerificationCode = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { verificationCode } = req.params;

    const user = await findUniqueUser({ verificationCode });

    if (!user) {
      throw ROUTE_NOT_FOUND;
    }
    next();
  } catch (err) {
    next(err);
  }
};
