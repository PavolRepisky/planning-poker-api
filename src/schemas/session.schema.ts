import config from 'config';
import * as yup from 'yup';

export const createSessionSchema = yup.object({
  body: yup.object({
    name: yup
      .string()
      .trim()
      .required('common.validations.required')
      .max(
        config.get<number>('maxNameLength'),
        'common.validations.string.max'
      ),
    matrixId: yup
      .number()
      .integer('common.validations.type')
      .typeError('common.validations.type')
      .required('common.validations.required'),
  }),
});

export const createVotingSchema = yup.object({
  body: yup.object({
    name: yup
      .string()
      .trim()
      .required('common.validations.required')
      .max(
        config.get<number>('maxNameLength'),
        'common.validations.string.max'
      ),
    description: yup.string().trim(),
  }),
});

export type CreateSessionInput = yup.InferType<typeof createSessionSchema>;

export type CreateVotingInput = yup.InferType<typeof createVotingSchema>;
