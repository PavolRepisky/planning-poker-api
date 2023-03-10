import { NextFunction, Request, Response } from 'express';
import { ValidationError } from 'express-validator';
import userService from '../../user/services/userService';
import { INTERNAL_SERVER_ERROR } from '../../core/types/internalServerError';
import { REQUEST_VALIDATION_ERROR } from '../../core/types/requestValidationError';

const validateEmailIsAvailable = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email } = req.body;
    const user = await userService.findByEmail(email);

    if (user) {
      const validationError = {
        value: email,
        msg: req.t('common.validations.uniqueEmail'),
        param: 'email',
        location: 'body',
      } as ValidationError;
      return next(REQUEST_VALIDATION_ERROR([validationError]));
    }
    next();
  } catch (err) {
    next(INTERNAL_SERVER_ERROR);
  }
};

export default validateEmailIsAvailable;
