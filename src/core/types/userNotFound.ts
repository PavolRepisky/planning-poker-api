import HttpCode from './httpCode';
import RequestError from './requestError';

const USER_NOT_FOUND = new RequestError({
  statusCode: HttpCode.NOT_FOUND,
  message: 'common.errors.user.notFound',
});

export default USER_NOT_FOUND;
