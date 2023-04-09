import { Schema } from 'express-validator';

const createVotingSchema: Schema = {
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
};

export default createVotingSchema;
