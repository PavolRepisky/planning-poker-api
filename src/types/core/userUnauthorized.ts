import HttpCode from './httpCode';
import RequestError from './requestError';

const USER_UNAUTHORIZED = new RequestError({
  statusCode: HttpCode.UNAUTHORIZED,
  message: 'common.errors.user.unauthorized',
});

export default USER_UNAUTHORIZED;
