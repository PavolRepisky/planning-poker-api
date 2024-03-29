import config from 'config';
import * as yup from 'yup';
import passwordRegex from '../utils/passwordRegex';

export const changeNameSchema = yup.object({
  body: yup.object({
    firstName: yup
      .string()
      .trim()
      .required('common.validations.required')
      .max(
        config.get<number>('maxNameLength'),
        'common.validations.string.max'
      ),
    lastName: yup
      .string()
      .trim()
      .required('common.validations.required')
      .max(
        config.get<number>('maxNameLength'),
        'common.validations.string.max'
      ),
  }),
});

export const changePasswordSchema = yup.object({
  body: yup.object({
    password: yup.string().required('common.validations.required'),
    newPassword: yup
      .string()
      .required('common.validations.required')
      .matches(passwordRegex, 'common.validations.password.weak'),
    confirmationPassword: yup
      .string()
      .required('common.validations.required')
      .oneOf([yup.ref('newPassword')], 'common.validations.password.match'),
  }),
});

export type ChangeNameInput = yup.InferType<typeof changeNameSchema>;

export type ChangePasswordInput = yup.InferType<typeof changePasswordSchema>;
