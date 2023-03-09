import HttpCode from './httpCode';
import RequestError from './requestError';

export const INTERNAL_SERVER_ERROR = new RequestError({
  statusCode: HttpCode.INTERNAL_SERVER_ERROR,
  message: 'common.errors.internal',
});
