import HttpCode from '../HttpCode';
import RequestError from './RequestError';

const ROUTE_NOT_FOUND = new RequestError({
  statusCode: HttpCode.NOT_FOUND,
  message: 'common.errors.route.notFound',
});

export default ROUTE_NOT_FOUND;
