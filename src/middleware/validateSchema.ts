import { NextFunction, Request, Response } from 'express';
import * as yup from 'yup';
import REQUEST_VALIDATION_ERROR from '../types/errors/RequestValidationError';
import ServerValidationError from '../types/errors/ServerValidationError';

const extractErrorsData = (
  req: Request,
  error: yup.ValidationError
): ServerValidationError[] => {
  const errorsData: ServerValidationError[] = [];

  error.inner.forEach((innerError) => {
    let location, path;
    if (innerError.path) {
      [location, path] = innerError.path.split('.');
    }

    errorsData.push({
      path,
      location,
      value: innerError.value,
      message: req.t(innerError.message),
    });
  });
  return errorsData;
};

export const validateSchema =
  (schema: yup.ObjectSchema<any>) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.validate(
        {
          body: req.body,
          query: req.query,
          params: req.params,
        },
        { abortEarly: false }
      );
      next();
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        next(REQUEST_VALIDATION_ERROR(extractErrorsData(req, err)));
      }
      next(err);
    }
  };
