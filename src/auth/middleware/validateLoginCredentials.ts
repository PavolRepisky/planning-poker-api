import { NextFunction, Request, Response } from 'express';
import userService from '../../core/services/userService';
import { INTERNAL_SERVER_ERROR } from '../../core/types/internalServerError';
import { USER_UNAUTHORIZED } from '../../core/types/userUnauthorized';
import comparePasswords from '../utils/comparePasswords';

const validateLoginCredentials = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;
    const user = await userService.findUserByEmail(email);

    if (!user) {
      return next(USER_UNAUTHORIZED);
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

export default validateLoginCredentials;
