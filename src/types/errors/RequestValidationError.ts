import { ValidationError } from 'express-validator';
import HttpCode from '../HttpCode';
import RequestError from './RequestError';

const REQUEST_VALIDATION_ERROR = (errors: ValidationError[]) =>
  new RequestError({
    statusCode: HttpCode.BAD_REQUEST,
    message: 'common.errors.validation',
    errors,
  });

export default REQUEST_VALIDATION_ERROR;
