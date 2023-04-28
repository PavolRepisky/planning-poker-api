import { NextFunction, Request, Response } from 'express';
import * as lodash from 'lodash';
import { excludedFields, findUniqueUser } from '../services/auth.service';
import USER_UNAUTHORIZED from '../types/errors/UserUnauthorized';
import { verifyJwt } from '../utils/jwt';

export const deserializeUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let access_token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      access_token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.access_token) {
      access_token = req.cookies.access_token;
    }

    if (!access_token) {
      throw USER_UNAUTHORIZED;
    }

    const decoded = verifyJwt<{ userId: string }>(
      access_token,
      'accessTokenKey'
    );

    if (!decoded) {
      throw USER_UNAUTHORIZED;
    }

    const user = await findUniqueUser({ id: decoded.userId });

    if (!user) {
      throw USER_UNAUTHORIZED;
    }

    res.locals.user = lodash.omit(user, excludedFields);

    next();
  } catch (err: any) {
    next(err);
  }
};
