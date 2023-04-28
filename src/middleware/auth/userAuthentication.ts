import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { oldConfig } from '../../config/config';
import USER_UNAUTHORIZED from '../../types/errors/UserUnauthorized';

const extractAuthorizationTokenFromHeaders = (req: Request): string | null => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return null;
  }
  return token;
};

const decodeAuthorizationToken = async (
  token: string
): Promise<jwt.JwtPayload | null> => {
  try {
    const decodedToken = await jwt.verify(token, oldConfig.server.token.secret);
    if (typeof decodedToken === 'string') {
      return null;
    }
    return decodedToken;
  } catch (err: any) {
    return null;
  }
};

const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const token = extractAuthorizationTokenFromHeaders(req);
  if (!token) {
    return next(USER_UNAUTHORIZED);
  }

  const decodedToken = await decodeAuthorizationToken(token);
  if (!decodedToken) {
    return next(USER_UNAUTHORIZED);
  }

  res.locals.token = decodedToken;
  next();
};

export default {
  extractAuthorizationTokenFromHeaders,
  decodeAuthorizationToken,
  authenticate,
};
