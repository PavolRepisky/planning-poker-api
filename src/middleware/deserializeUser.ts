import { NextFunction, Request, Response } from 'express';
import * as lodash from 'lodash';
import { excludedFields } from '../services/auth.service';
import { findUniqueUser } from '../services/user.service';
import USER_UNAUTHORIZED from '../types/errors/UserUnauthorized';
import { verifyJwt } from '../utils/jwt';

export const deserializeUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let accessToken;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      accessToken = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.access_token) {
      accessToken = req.cookies.access_token;
    }

    if (!accessToken) {
      throw USER_UNAUTHORIZED;
    }

    const decoded = verifyJwt<{ userId: string }>(
      accessToken,
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
