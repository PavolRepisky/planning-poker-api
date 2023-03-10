import { Schema } from 'express-validator';

const nameUpdateSchema: Schema = {
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
};

export default nameUpdateSchema;
