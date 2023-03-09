import HttpCode from './httpCode';
import RequestError from './requestError';

export const USER_UNAUTHORIZED = new RequestError({
  statusCode: HttpCode.UNAUTHORIZED,
  message: 'common.errors.user.unauthorized',
});
