import { Schema } from 'express-validator';
import hasUniqueValues from '../utils/hasUniqueValues';
import isTwoDimensionalArray from '../utils/isTwoDimesionalStringArray';

const createEditSchema: Schema = {
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
  rows: {
    exists: {
      options: { checkFalsy: true },
      errorMessage: 'common.validations.required',
      bail: true,
    },
    isInt: {
      options: { min: 2 },
      errorMessage: 'common.validations.matrixSize',
    },
    toInt: true,
  },
  columns: {
    exists: {
      options: { checkFalsy: true },
      errorMessage: 'common.validations.required',
      bail: true,
    },
    isInt: {
      options: { min: 2 },
      errorMessage: 'common.validations.matrixSize',
    },
    toInt: true,
  },
  values: {
    custom: {
      options: async (values: any[], { req }) => {
        if (!isTwoDimensionalArray(values)) {
          throw new Error('common.validations.twoDimStringArray');
        }

        if (!hasUniqueValues(values)) {
          throw new Error('common.validations.uniqueValues');
        }

        let validSize = false;
        let rows = 0;
        let columns = 0;
        try {
          rows = Number.parseInt(req.body.rows);
          columns = Number.parseInt(req.body.columns);
          validSize = rows > 1 && columns > 1;
        } catch {}

        if (
          validSize &&
          (values.length != rows ||
            !values.every((arr) => arr.length === columns))
        ) {
          throw new Error('common.validations.sizeMatch');
        }
        return true;
      },
    },
  },
};

export default createEditSchema;
