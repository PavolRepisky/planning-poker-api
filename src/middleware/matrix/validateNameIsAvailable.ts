import { NextFunction, Request, Response } from 'express';
import { ValidationError } from 'express-validator';
import matrixService from '../../services/matrixService';
import INTERNAL_SERVER_ERROR from '../../types/core/internalServerError';
import REQUEST_VALIDATION_ERROR from '../../types/core/requestValidationError';

const validateNamelIsAvailable = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name } = req.body;

    const matrix = await matrixService.findByName(name);
    if (
      matrix &&
      (req.method !== 'PATCH' || matrix.id != Number(req.params?.id))
    ) {
      const validationError = {
        value: name,
        msg: req.t('common.validations.uniqueName'),
        param: 'name',
        location: 'body',
      } as ValidationError;
      return next(REQUEST_VALIDATION_ERROR([validationError]));
    }
    next();
  } catch (err) {
    next(INTERNAL_SERVER_ERROR);
  }
};

export default validateNamelIsAvailable;
