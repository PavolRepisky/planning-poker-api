import { Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';
import config from 'config';
import crypto from 'crypto';
import { CookieOptions, NextFunction, Request, Response } from 'express';
import {
  ForgotPasswordBody,
  LoginRequestBody,
  RegisterRequestBody,
  ResetPasswordInput,
  VerifyEmailRequestParams,
} from '../schemas/auth.schema';
import { createUser, removeUser, signTokens } from '../services/auth.service';
import { findUniqueUser, findUser, updateUser } from '../services/user.service';
import HttpCode from '../types/HttpCode';
import USER_NOT_FOUND from '../types/errors/UserNotFound';
import USER_UNAUTHORIZED from '../types/errors/UserUnauthorized';
import ServerValidationError from '../types/errors/ValidationError';
import Email from '../utils/Email';
import { signJwt, verifyJwt } from '../utils/jwt';

const cookiesOptions: CookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
};

if (process.env.NODE_ENV === 'production') cookiesOptions.secure = true;

const accessTokenCookieOptions: CookieOptions = {
  ...cookiesOptions,
  expires: new Date(
    Date.now() + config.get<number>('accessTokenExpiresIn') * 60 * 1000
  ),
  maxAge: config.get<number>('accessTokenExpiresIn') * 60 * 1000,
};

const refreshTokenCookieOptions: CookieOptions = {
  ...cookiesOptions,
  expires: new Date(
    Date.now() + config.get<number>('refreshTokenExpiresIn') * 60 * 1000
  ),
  maxAge: config.get<number>('refreshTokenExpiresIn') * 60 * 1000,
};

export const registerUserHandler = async (
  req: Request<{}, {}, RegisterRequestBody>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { firstName, lastName, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(
      password,
      config.get<number>('hashSalt')
    );

    const user = await createUser({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    const redirectUrl = `${config.get<string>('origin')}/verify-email/${
      user.verificationCode
    }`;

    await new Email(user, redirectUrl).sendVerificationCode(req);

    res.status(HttpCode.CREATED).json({
      message: req.t('auth.register.success'),
      data: {
        userId: user.id,
      },
    });
  } catch (err: any) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2002') {
        const error: ServerValidationError = {
          path: 'email',
          location: 'body',
          value: req.body.email,
          message: req.t('common.validations.email.taken'),
        };

        res.status(HttpCode.BAD_REQUEST).json({
          status: 'fail',
          errors: [error],
        });
        return;
      }
    }

    try {
      await removeUser({ email: email.toLowerCase() });
    } catch {}

    next(err);
  }
};

export const loginUserHandler = async (
  req: Request<{}, {}, LoginRequestBody>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await findUniqueUser(
      { email: email.toLowerCase() },
      { id: true, email: true, verified: true, password: true }
    );

    if (
      !user ||
      !user.verified ||
      !(await bcrypt.compare(password, user.password))
    ) {
      throw USER_UNAUTHORIZED;
    }

    const { accessToken, refreshToken } = await signTokens(user);

    res.cookie('access_token', accessToken, accessTokenCookieOptions);
    res.cookie('refresh_token', refreshToken, refreshTokenCookieOptions);
    res.cookie('logged_in', true, {
      ...accessTokenCookieOptions,
      httpOnly: false,
    });

    res.status(HttpCode.OK).json({
      message: req.t('auth.login.success'),
      data: {
        accessToken,
      },
    });
  } catch (err: any) {
    next(err);
  }
};

export const refreshAccessTokenHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const refreshToken = req.cookies.refresh_token;

    if (!refreshToken) {
      throw USER_UNAUTHORIZED;
    }

    const decodedToken = verifyJwt<{ userId: string }>(
      refreshToken,
      'refreshTokenKey'
    );

    if (!decodedToken) {
      throw USER_UNAUTHORIZED;
    }

    const user = await findUniqueUser({ id: decodedToken.userId });

    if (!user) {
      throw USER_UNAUTHORIZED;
    }

    const access_token = signJwt({ sub: user.id }, 'accessTokenKey', {
      expiresIn: `${config.get<number>('accessTokenExpiresIn')}m`,
    });

    res.cookie('access_token', access_token, accessTokenCookieOptions);
    res.cookie('logged_in', true, {
      ...accessTokenCookieOptions,
      httpOnly: false,
    });

    res.status(HttpCode.OK).json({
      message: req.t('auth.refresh.success'),
      data: {
        access_token,
      },
    });
  } catch (err: any) {
    next(err);
  }
};

const logout = (res: Response) => {
  res.cookie('access_token', '', { maxAge: 1 });
  res.cookie('refresh_token', '', { maxAge: 1 });
  res.cookie('logged_in', '', { maxAge: 1 });
};

export const logoutUserHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    logout(res);

    res.status(HttpCode.OK).json({
      message: req.t('auth.logout.success'),
    });
  } catch (err: any) {
    next(err);
  }
};

export const verifyEmailHandler = async (
  req: Request<VerifyEmailRequestParams>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { verificationCode } = req.params;

    await updateUser({ verificationCode }, { verified: true }, { id: true });

    res.status(HttpCode.OK).json({
      message: req.t('auth.verify.success'),
    });
  } catch (err: any) {
    if (err.code === 'P2025') {
      return next(USER_NOT_FOUND);
    }
    next(err);
  }
};

export const forgotPasswordHandler = async (
  req: Request<
    Record<string, never>,
    Record<string, never>,
    ForgotPasswordBody
  >,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await findUniqueUser({ email: req.body.email.toLowerCase() });

    if (!user) {
      throw USER_NOT_FOUND;
    }

    if (!user.verified) {
      throw USER_UNAUTHORIZED;
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    await updateUser(
      { id: user.id },
      {
        passwordResetToken,
        passwordResetAt: new Date(Date.now() + 10 * 60 * 1000),
      },
      { email: true }
    );

    try {
      const url = `${config.get<string>(
        'origin'
      )}/reset-password/${resetToken}`;
      await new Email(user, url).sendPasswordResetToken(req);

      res.status(HttpCode.OK).json({
        message: req.t('auth.forgot.success'),
      });
    } catch (err: any) {
      await updateUser(
        { id: user.id },
        { passwordResetToken: null, passwordResetAt: null },
        {}
      );
      throw err;
    }
  } catch (err: any) {
    next(err);
  }
};

export const resetPasswordHandler = async (
  req: Request<
    ResetPasswordInput['params'],
    Record<string, never>,
    ResetPasswordInput['body']
  >,
  res: Response,
  next: NextFunction
) => {
  try {
    const passwordResetToken = crypto
      .createHash('sha256')
      .update(req.params.resetToken)
      .digest('hex');

    const user = await findUser({
      passwordResetToken,
      passwordResetAt: {
        gt: new Date(),
      },
    });

    if (!user) {
      throw USER_NOT_FOUND;
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 12);

    await updateUser(
      {
        id: user.id,
      },
      {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetAt: null,
      },
      { email: true }
    );

    logout(res);
    res.status(200).json({
      status: 'success',
      message: 'Password data updated successfully',
    });
  } catch (err: any) {
    next(err);
  }
};
