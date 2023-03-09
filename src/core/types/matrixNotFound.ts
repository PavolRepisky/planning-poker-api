import HttpCode from './httpCode';
import RequestError from './requestError';

export const MATRIX_NOT_FOUND = new RequestError({
  statusCode: HttpCode.NOT_FOUND,
  message: 'common.errors.matrix.notFound',
});
