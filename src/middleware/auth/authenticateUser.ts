import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import config from '../../config/config';
import USER_UNAUTHORIZED from '../../types/core/userUnauthorized';

const authenticateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      throw USER_UNAUTHORIZED;
    }

    const decodedToken = await jwt.verify(token, config.server.token.secret);
    if (typeof decodedToken === 'string') {
      throw USER_UNAUTHORIZED;
    }
    res.locals.token = decodedToken;
    next();
  } catch (err: any) {
    next(USER_UNAUTHORIZED);
  }
};

export default authenticateUser;
