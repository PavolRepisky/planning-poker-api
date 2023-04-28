import { ValidationError } from 'express-validator';
import HttpCode from '../HttpCode';

interface RequestErrorArgs {
  name?: string;
  statusCode: HttpCode;
  message: string;
  errors?: ValidationError[];
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
