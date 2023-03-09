import express, { NextFunction, Request, Response } from 'express';
import morgan from 'morgan';
import authRoutes from './auth/routes/authRoutes';
import i18NextSetup from './core/config/i18n';
import HttpCode from './core/types/httpCode';
import RequestError from './core/types/requestError';
export const app = express();

/* Request body parsing */
app.use(express.json());

/* Logging */
app.use(morgan('dev'));

/* Localization */
app.use(i18NextSetup);

/* API Rules */
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'OPTIONS, GET, POST, PUT, PATCH, DELETE'
  );
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

/* Routes */
app.use(authRoutes);

/* Error handling */
app.use(
  (
    err: RequestError | Error,
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    if (err instanceof RequestError) {
      return res.status(err.statusCode).json({
        message: req.t(err.message as any),
        errors: err.errors,
      });
    }
    return res.status(HttpCode.INTERNAL_SERVER_ERROR).json({
      message: req.t('common.errors.internal'),
    });
  }
);
