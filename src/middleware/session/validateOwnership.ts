import { NextFunction, Request, Response } from 'express';
import sessionService from '../../services/sessionService';
import INTERNAL_SERVER_ERROR from '../../types/core/internalServerError';
import SESSION_NOT_FOUND from '../../types/core/sessionNotFound';
import USER_UNAUTHORIZED from '../../types/core/userUnauthorized';

const validateOwnership = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const decodedToken = res.locals.token;
    const { hashId } = req.params;

    const session = await sessionService.findByHashId(hashId);

    if (!session) {
      return next(SESSION_NOT_FOUND);
    }

    if (session.ownerId !== decodedToken.userId) {
      return next(USER_UNAUTHORIZED);
    }
    next();
  } catch (err) {
    next(INTERNAL_SERVER_ERROR);
  }
};

export default validateOwnership;