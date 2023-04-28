import { NextFunction, Request, Response } from 'express';
import sessionService from '../../services/sessionService';
import SESSION_NOT_FOUND from '../../types/core/sessionNotFound';
import INTERNAL_SERVER_ERROR from '../../types/errors/InternalServerError';

const validateSessionId = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { hashId } = req.params;

    const session = await sessionService.findByHashId(hashId);

    if (!session) {
      return next(SESSION_NOT_FOUND);
    }

    next();
  } catch (err) {
    next(INTERNAL_SERVER_ERROR);
  }
};

export default validateSessionId;
