import HttpCode from '../HttpCode';
import RequestError from './RequestError';

const BAD_REQUEST = new RequestError({
  statusCode: HttpCode.BAD_REQUEST,
  message: 'common.errors.badRequest',
});

export default BAD_REQUEST;
