import { Schema } from 'express-validator';

const loginSchema: Schema = {
  email: {
    exists: {
      options: { checkFalsy: true },
      errorMessage: 'common.validations.required',
      bail: true,
    },
    isEmail: {
      errorMessage: 'common.validations.email',
      bail: true,
    },
    normalizeEmail: true,
  },
  password: {
    exists: {
      options: { checkFalsy: true },
      errorMessage: 'common.validations.required',
      bail: true,
    },
  },
};

export default loginSchema;
