import HttpCode from '../HttpCode';
import ServerValidationError from './ServerValidationError';
interface RequestErrorArgs {
  name?: string;
  statusCode: HttpCode;
  message: string;
  errors?: ServerValidationError[];
}

class RequestError extends Error {
  public readonly name: string;
  public readonly statusCode: HttpCode;
  public readonly errors?: any[];

  constructor(args: RequestErrorArgs) {
    super(args.message);

    Object.setPrototypeOf(this, new.target.prototype);

    this.name = args.name || 'Error';
    this.statusCode = args.statusCode;

    if (args.errors) {
      this.errors = args.errors;
    }

    Error.captureStackTrace(this);
  }
}

export default RequestError;
