import { NextFunction, Request, Response } from 'express';
import userAuthentication from '../auth/userAuthentication';

const authenticateLoggedUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = userAuthentication.extractAuthorizationTokenFromHeaders(req);
    if (!token) {
      return next();
    }
    const decodedToken = await userAuthentication.decodeAuthorizationToken(token);
    if (!decodedToken) {
      return next();
    }

    res.locals.token = decodedToken;
    next();
  } catch {}
};

export default authenticateLoggedUser;
