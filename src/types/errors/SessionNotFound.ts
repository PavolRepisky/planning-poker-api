import HttpCode from '../HttpCode';
import RequestError from './RequestError';

const SESSION_NOT_FOUND = new RequestError({
  statusCode: HttpCode.NOT_FOUND,
  message: 'common.errors.session.notFound',
});

export default SESSION_NOT_FOUND;
