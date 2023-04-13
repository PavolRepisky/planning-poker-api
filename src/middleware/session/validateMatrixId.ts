import { NextFunction, Request, Response } from 'express';
import { ValidationError } from 'express-validator';
import matrixService from '../../services/matrixService';
import INTERNAL_SERVER_ERROR from '../../types/core/internalServerError';
import REQUEST_VALIDATION_ERROR from '../../types/core/requestValidationError';

const validateMatrixId = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { matrixId } = req.body;
    const decodedToken = res.locals.token;

    const matrix = await matrixService.findById(matrixId);
    if (!matrix || matrix.creatorId !== decodedToken.userId) {
      const validationError = {
        value: matrixId,
        msg: req.t('common.validations.matrixId'),
        param: 'matrixId',
        location: 'body',
      } as ValidationError;
      return next(REQUEST_VALIDATION_ERROR([validationError]));
    }

    next();
  } catch (err) {
    next(INTERNAL_SERVER_ERROR);
  }
};

export default validateMatrixId;
