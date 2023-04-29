import config from 'config';
import * as yup from 'yup';
import passwordRegex from '../utils/passwordRegex';

export const regsiterSchema = yup.object({
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
    email: yup
      .string()
      .trim()
      .required('common.validations.required')
      .email('common.validations.email.invalid'),
    password: yup
      .string()
      .required('common.validations.required')
      .matches(passwordRegex, 'common.validations.password.weak'),
    confirmationPassword: yup
      .string()
      .required('common.validations.required')
      .oneOf([yup.ref('password')], 'common.validations.password.match'),
  }),
});

export const loginSchema = yup.object({
  body: yup.object({
    email: yup
      .string()
      .trim()
      .required('common.validations.required')
      .email('common.validations.email.invalid'),
    password: yup.string().required('common.validations.required'),
  }),
});

export const verifyEmailSchema = yup.object({
  params: yup.object({
    verificationCode: yup.string().required('common.validations.required'),
  }),
});

export const forgotPasswordSchema = yup.object({
  body: yup.object({
    email: yup
      .string()
      .trim()
      .required('common.validations.required')
      .email('common.validations.email.invalid'),
  }),
});

export const resetPasswordSchema = yup.object({
  params: yup.object({
    resetToken: yup.string().required('common.validations.required'),
  }),
  body: yup.object({
    password: yup
      .string()
      .required('common.validations.required')
      .matches(passwordRegex, 'common.validations.password.weak'),
    confirmationPassword: yup
      .string()
      .required('common.validations.required')
      .oneOf([yup.ref('password')], 'common.validations.password.match'),
  }),
});

export type RegisterInput = yup.InferType<typeof regsiterSchema>;

export type LoginInput = yup.InferType<typeof loginSchema>;

export type VerifyEmailInput = yup.InferType<typeof verifyEmailSchema>;

export type ForgotPasswordInput = yup.InferType<typeof forgotPasswordSchema>;

export type ResetPasswordInput = yup.InferType<typeof resetPasswordSchema>;
