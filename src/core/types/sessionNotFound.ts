import HttpCode from './httpCode';
import RequestError from './requestError';

export const SESSION_NOT_FOUND = new RequestError({
  statusCode: HttpCode.NOT_FOUND,
  message: 'common.errors.session.notFound',
});
