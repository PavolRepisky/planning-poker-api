import { Schema } from 'express-validator';
import passwordRegex from '../../types/auth/passwordRegex';

const registerSchema: Schema = {
  firstName: {
    exists: {
      options: { checkFalsy: true },
      errorMessage: 'common.validations.required',
      bail: true,
    },
    trim: true,
    isLength: {
      options: { min: 3, max: 50 },
      errorMessage: 'common.validations.nameLength',
    },
  },
  lastName: {
    exists: {
      options: { checkFalsy: true },
      errorMessage: 'common.validations.required',
      bail: true,
    },
    trim: true,
    isLength: {
      options: { min: 3, max: 50 },
      errorMessage: 'common.validations.nameLength',
    },
  },
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
    matches: {
      options: passwordRegex,
      errorMessage: 'common.validations.password',
    },
  },
  confirmationPassword: {
    exists: {
      options: { checkFalsy: true },
      errorMessage: 'common.validations.required',
      bail: true,
    },
    custom: {
      options: (confirmationPassword: string, { req }) => {
        if (confirmationPassword !== req.body.password) {
          throw new Error('common.validations.passwordsMatch');
        }
        return true;
      },
    },
  },
};

export default registerSchema;
