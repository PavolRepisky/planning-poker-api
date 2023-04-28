import * as yup from 'yup';
import passwordRegex from '../utils/passwordRegex';

export const changeNameSchema = yup.object({
  body: yup.object({
    firstName: yup
      .string()
      .trim()
      .required('common.validations.required')
      .max(50, 'common.validations.string.maxLength'),
    lastName: yup
      .string()
      .trim()
      .required('common.validations.required')
      .max(50, 'common.validations.string.maxLength'),
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

export type ChangeNameRequestBody = yup.InferType<
  typeof changeNameSchema
>['body'];

export type ChangePasswordRequestBody = yup.InferType<
  typeof changePasswordSchema
>['body'];
