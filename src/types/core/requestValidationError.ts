import { ValidationError } from 'express-validator';
import HttpCode from './httpCode';
import RequestError from './requestError';

const REQUEST_VALIDATION_ERROR = (errors: ValidationError[]) =>
  new RequestError({
    statusCode: HttpCode.BAD_REQUEST,
    message: 'common.errors.requestValidation',
    errors,
  });

export default REQUEST_VALIDATION_ERROR;
