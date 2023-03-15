import { NextFunction, Request, Response } from 'express';
import userService from '../../services/userService';
import INTERNAL_SERVER_ERROR from '../../types/core/internalServerError';
import USER_UNAUTHORIZED from '../../types/core/userUnauthorized';
import comparePasswords from '../../utils/auth/comparePasswords';

const validateLoginCredentials = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;
    const user = await userService.findByEmail(email);

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
