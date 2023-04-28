import { NextFunction, Request, Response } from 'express';
import * as yup from 'yup';
import ServerValidationError from '../types/errors/ValidationError';

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

export const validate =
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
        return res.status(400).json({
          status: 'fail',
          errors: extractErrorsData(req, err),
        });
      }
      next(err);
    }
  };
