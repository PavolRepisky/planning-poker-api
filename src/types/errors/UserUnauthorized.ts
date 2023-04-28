import HttpCode from '../HttpCode';
import RequestError from './RequestError';

const USER_UNAUTHORIZED = new RequestError({
  statusCode: HttpCode.UNAUTHORIZED,
  message: 'common.errors.user.unauthorized',
});

export default USER_UNAUTHORIZED;
