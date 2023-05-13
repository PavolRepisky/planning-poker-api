import HttpCode from '../HttpCode';
import RequestError from './RequestError';
import ServerValidationError from './ServerValidationError';

const REQUEST_VALIDATION_ERROR = (errors: ServerValidationError[]) =>
  new RequestError({
    statusCode: HttpCode.BAD_REQUEST,
    message: 'common.errors.validation',
    errors,
  });

export default REQUEST_VALIDATION_ERROR;
