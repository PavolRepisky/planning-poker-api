import { NextFunction, Request, Response } from 'express';
import matrixService from '../../services/matrixService';
import INTERNAL_SERVER_ERROR from '../../types/core/internalServerError';
import MATRIX_NOT_FOUND from '../../types/core/matrixNotFound';
import USER_UNAUTHORIZED from '../../types/core/userUnauthorized';

const validateOwnership = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const decodedToken = res.locals.token;
    const matrixId = Number(req.params.id);

    const matrix = await matrixService.findById(matrixId);
    if (!matrix) {
      return next(MATRIX_NOT_FOUND);
    }

    if (matrix.creatorId !== decodedToken.userId) {
      return next(USER_UNAUTHORIZED);
    }
    next();
  } catch (err) {
    next(INTERNAL_SERVER_ERROR);
  }
};

export default validateOwnership;
