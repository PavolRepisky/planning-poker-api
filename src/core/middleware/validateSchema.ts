import { NextFunction, Request, Response } from 'express';
import { ValidationChain, validationResult } from 'express-validator';
import { REQUEST_VALIDATION_ERROR } from '../types/requestValidationError';

const validateSchema = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req).array();
    if (errors.length === 0) {
      return next();
    }

    errors.forEach((error) => {
      error.msg = req.t(error.msg);
    });

    return next(REQUEST_VALIDATION_ERROR(errors));
  };
};

export default validateSchema;
