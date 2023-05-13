import { Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';
import config from 'config';
import crypto from 'crypto';
import { CookieOptions, NextFunction, Request, Response } from 'express';
import Email from '../classes/Email';
import {
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
} from '../schemas/auth.schema';
import { createUser, removeUser, signTokens } from '../services/auth.service';
import { findUniqueUser, updateUser } from '../services/user.service';
import HttpCode from '../types/HttpCode';
import BAD_REQUEST from '../types/errors/BadRequest';
import REQUEST_VALIDATION_ERROR from '../types/errors/RequestValidationError';
import ServerValidationError from '../types/errors/ServerValidationError';
import USER_NOT_FOUND from '../types/errors/UserNotFound';
import USER_NOT_VERIFIED from '../types/errors/UserNotVerified';
import USER_UNAUTHORIZED from '../types/errors/UserUnauthorized';
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
  req: Request<{}, {}, RegisterInput['body']>,
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
      email,
      password: hashedPassword,
    });

    const redirectUrl = `${config.get<string>('origin')}/verify-email/${
      user.verificationCode
    }`;

    if (process.env.NODE_ENV !== 'test')
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
        const errors: ServerValidationError[] = [
          {
            path: 'email',
            location: 'body',
            value: req.body.email,
            message: req.t('common.validations.email.taken'),
          },
        ];
        return next(REQUEST_VALIDATION_ERROR(errors));
      }
    }
    try {
      await removeUser({ email: email });
    } catch {}

    next(err);
  }
};

export const loginUserHandler = async (
  req: Request<{}, {}, LoginInput['body']>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await findUniqueUser(
      { email: email },
      { id: true, email: true, verified: true, password: true }
    );

    if (user && !user.verified) {
      throw USER_NOT_VERIFIED;
    }

    if (!user || !(await bcrypt.compare(password, user.password))) {
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
      throw BAD_REQUEST;
    }

    const decodedToken = verifyJwt<{ userId: string }>(
      refreshToken,
      'refreshTokenKey'
    );

    if (!decodedToken) {
      throw BAD_REQUEST;
    }

    const user = await findUniqueUser({ id: decodedToken.userId });

    if (!user) {
      throw BAD_REQUEST;
    }

    const accessToken = signJwt({ userId: user.id }, 'accessTokenKey', {
      expiresIn: `${config.get<number>('accessTokenExpiresIn')}m`,
    });

    res.cookie('access_token', accessToken, accessTokenCookieOptions);
    res.cookie('logged_in', true, {
      ...accessTokenCookieOptions,
      httpOnly: false,
    });

    res.status(HttpCode.OK).json({
      message: req.t('auth.refresh.success'),
      data: {
        accessToken,
      },
    });
  } catch (err: any) {
    next(err);
  }
};

const logout = (res: Response) => {
  res.cookie('access_token', '', { maxAge: -1 });
  res.cookie('refresh_token', '', { maxAge: -1 });
  res.cookie('logged_in', '', { maxAge: -1 });
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
  req: Request,
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
  req: Request<{}, {}, ForgotPasswordInput['body']>,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await findUniqueUser({ email: req.body.email });

    if (!user) {
      const errors: ServerValidationError[] = [
        {
          path: 'email',
          location: 'body',
          value: req.body.email,
          message: req.t('common.validations.email.invalid'),
        },
      ];
      throw REQUEST_VALIDATION_ERROR(errors);
    }

    if (!user.verified) {
      throw USER_NOT_VERIFIED;
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
    Record<string, any>,
    Record<string, never>,
    ResetPasswordInput['body']
  >,
  res: Response,
  next: NextFunction
) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 12);

    await updateUser(
      {
        id: res.locals.userId,
      },
      {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetAt: null,
      },
      { email: true }
    );

    logout(res);

    res.status(HttpCode.OK).json({
      message: req.t('auth.reset.success'),
    });
  } catch (err: any) {
    next(err);
  }
};
