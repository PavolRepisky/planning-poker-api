import { Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';
import config from 'config';
import { CookieOptions, NextFunction, Request, Response } from 'express';
import {
  LoginRequestBody,
  RegisterRequestBody,
  VerifyEmailRequestParams,
} from '../schemas/auth.schema';
import {
  createUser,
  findUniqueUser,
  removeUser,
  signTokens,
  updateUser,
} from '../services/auth.service';
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

export const registerUser = async (
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

export const loginUser = async (
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

export const refreshAccessToken = async (
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

export const logoutUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    res.cookie('access_token', '', { maxAge: -1 });
    res.cookie('refresh_token', '', { maxAge: -1 });
    res.cookie('logged_in', '', { maxAge: -1 });

    res.status(HttpCode.OK).json({
      message: req.t('auth.logout.success'),
    });
  } catch (err: any) {
    next(err);
  }
};

export const verifyEmail = async (
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
