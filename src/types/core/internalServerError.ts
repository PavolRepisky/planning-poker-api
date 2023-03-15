import HttpCode from './httpCode';
import RequestError from './requestError';

const INTERNAL_SERVER_ERROR = new RequestError({
  statusCode: HttpCode.INTERNAL_SERVER_ERROR,
  message: 'common.errors.internal',
});

export default INTERNAL_SERVER_ERROR;
