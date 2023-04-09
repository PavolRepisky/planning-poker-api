import { Schema } from 'express-validator';

const createSchema: Schema = {
  name: {
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
  matrixId: {
    exists: {
      options: { checkFalsy: true },
      errorMessage: 'common.validations.required',
      bail: true,
    },
    isInt: {
      bail: true,
      options: { min: 1 },
      errorMessage: 'common.validations.integer',
    },
    toInt: true,
  },
};

export default createSchema;
