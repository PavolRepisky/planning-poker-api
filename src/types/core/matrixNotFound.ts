import HttpCode from './httpCode';
import RequestError from './requestError';

const MATRIX_NOT_FOUND = new RequestError({
  statusCode: HttpCode.NOT_FOUND,
  message: 'common.errors.matrix.notFound',
});

export default MATRIX_NOT_FOUND;
