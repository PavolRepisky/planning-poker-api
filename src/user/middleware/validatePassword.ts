import { NextFunction, Request, Response } from 'express';
import comparePasswords from '../../auth/utils/comparePasswords';
import userService from '../services/userService';
import { INTERNAL_SERVER_ERROR } from '../../core/types/internalServerError';
import USER_NOT_FOUND from '../../core/types/userNotFound';
import { USER_UNAUTHORIZED } from '../../core/types/userUnauthorized';

const validatePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const decodedToken = res.locals.token;
    const { password } = req.body;

    const user = await userService.findById(decodedToken.userId);

    if (!user) {
      return next(USER_NOT_FOUND);
    }

    const passwordIsCorrect = comparePasswords(password, user.password);

    if (!passwordIsCorrect) {
      return next(USER_UNAUTHORIZED);
    }
    next();
  } catch (err) {
    next(INTERNAL_SERVER_ERROR);
  }
};

export default validatePassword;
