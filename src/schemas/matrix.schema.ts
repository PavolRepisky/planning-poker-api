import config from 'config';
import * as yup from 'yup';

export const createEditSchema = yup.object({
  body: yup.object({
    name: yup
      .string()
      .trim()
      .required('common.validations.required')
      .max(
        config.get<number>('maxNameLength'),
        'common.validations.string.max'
      ),
    rows: yup
      .number()
      .integer('common.validations.type')
      .typeError('common.validations.type')
      .required('common.validations.required')
      .max(
        config.get<number>('matrixMaxRows'),
        'common.validations.integer.max'
      )
      .min(
        config.get<number>('matrixMinRows'),
        'common.validations.integer.min'
      ),
    columns: yup
      .number()
      .integer('common.validations.type')
      .typeError('common.validations.type')
      .required('common.validations.required')
      .max(
        config.get<number>('matrixMaxColumns'),
        'common.validations.integer.max'
      )
      .min(
        config.get<number>('matrixMinColumns'),
        'common.validations.integer.min'
      ),
    values: yup
      .array()
      .typeError('common.validations.type')
      .required('common.validations.required')
      .test('2d-array', 'common.validations.type', function (value) {
        return (
          Array.isArray(value) &&
          value.length === this.parent.rows &&
          value.every(
            (row) => Array.isArray(row) && row.length === this.parent.columns
          )
        );
      })
      .test('non-empty-values', 'common.validations.required', (value) => {
        if (Array.isArray(value)) {
          return value.every(
            (row) =>
              Array.isArray(row) &&
              row.every(
                (item: string | undefined) => item && item.trim().length > 0
              )
          );
        }
      })
      .test(
        'unique-values',
        'common.validations.matrix.uniqueValues',
        (value) => {
          if (Array.isArray(value)) {
            const flattenValues = value.flat();
            return new Set(flattenValues).size === flattenValues.length;
          }
          return true;
        }
      ),
  }),
});

export type CreateEditInput = yup.InferType<typeof createEditSchema>;
