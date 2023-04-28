import { NextFunction, Request, Response } from 'express';
import authService from '../services/authService';
import userService from '../services/userService';
import HttpCode from '../types/core/httpCode';
import USER_NOT_FOUND from '../types/core/userNotFound';
import UserData from '../types/user/userData';
import signToken from '../utils/auth/signToken';
import sendConfirmationEmail from '../utils/core/nodemailer';

const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { firstName, lastName, email, password } = req.body;

    const user = await authService.createUser(
      firstName,
      lastName,
      email,
      password
    );

    // await sendConfirmationEmail(user.email, user.confirmationCode);

    res.status(HttpCode.CREATED).json({
      message: req.t('auth.register.success'),
      data: {
        userId: user.id,
      },
    });
  } catch (err: any) {
    next(err);
  }
};

const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email } = req.body;
    const user = await userService.findByEmail(email);

    if (!user) {
      throw USER_NOT_FOUND;
    }

    // if (user.accountStatus === AccountStatus.PENDING) {
    //   return next(USER_UNAUTHORIZED);
    // }

    const token = signToken(user.email, user.id);

    res.status(HttpCode.OK).json({
      message: req.t('auth.login.success'),
      data: {
        token,
      },
    });
  } catch (err: any) {
    next(err);
  }
};

const getUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const decodedToken = res.locals.token;

    const user = await userService.findById(decodedToken.userId);

    if (!user) {
      throw USER_NOT_FOUND;
    }

    const { id, firstName, lastName, email } = user;

    res.status(HttpCode.OK).json({
      message: req.t('auth.getUser.success'),
      data: {
        user: {
          id,
          firstName,
          lastName,
          email,
        } as UserData,
      },
    });
  } catch (err: any) {
    next(err);
  }
};

// const confirmEmail = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ): Promise<void> => {
//   try {
//     const { confirmationCode } = req.params;
//     const user = await userService.findByConfirmationCode(confirmationCode);

//     if (!user) {
//       throw USER_NOT_FOUND;
//     }

//     if (!userService.activateAccount(user.id)) {
//       throw INTERNAL_SERVER_ERROR;
//     }

//     res.status(HttpCode.OK).json({
//       message: req.t('auth.account.success'),
//     });
//   } catch {}
// };

export default { register, login, getUser };
