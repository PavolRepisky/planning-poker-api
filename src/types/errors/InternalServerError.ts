import HttpCode from '../HttpCode';
import RequestError from './RequestError';

const INTERNAL_SERVER_ERROR = new RequestError({
  statusCode: HttpCode.INTERNAL_SERVER_ERROR,
  message: 'common.errors.internal',
});

export default INTERNAL_SERVER_ERROR;
