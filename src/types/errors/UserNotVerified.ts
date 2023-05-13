import HttpCode from '../HttpCode';
import RequestError from './RequestError';

const USER_NOT_VERIFIED = new RequestError({
  statusCode: HttpCode.FORBIDDEN,
  message: 'common.errors.user.notVerified',
});

export default USER_NOT_VERIFIED;
