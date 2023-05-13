import HttpCode from '../HttpCode';
import RequestError from './RequestError';

const USER_NOT_FOUND = new RequestError({
  statusCode: HttpCode.NOT_FOUND,
  message: 'common.errors.user.notFound',
});

export default USER_NOT_FOUND;
