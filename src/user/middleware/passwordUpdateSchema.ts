import { Schema } from 'express-validator';
import passwordRegex from '../../auth/types/passwordRegex';

const passwordUpdateSchema: Schema = {
  password: {
    exists: {
      options: { checkFalsy: true },
      errorMessage: 'common.validations.required',
      bail: true,
    },
  },
  newPassword: {
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
        if (confirmationPassword !== req.body.newPassword) {
          throw new Error('common.validations.passwordsMatch');
        }
        return true;
      },
    },
  },
};

export default passwordUpdateSchema;
