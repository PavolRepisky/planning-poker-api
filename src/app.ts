import * as cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import * as http from 'http';
import morgan from 'morgan';
import i18NextSetup from './config/i18n';
import authRoutes from './routes/authRoutes';
import matrixRoutes from './routes/matrixRoutes';
import sessionRoutes from './routes/sessionRoutes';
import userRoutes from './routes/userRoutes';
import HttpCode from './types/core/httpCode';
import RequestError from './types/core/requestError';
import { setupSocketServer } from './utils/session/socketManager';

const app = express();
const server = http.createServer(app);
setupSocketServer(server);

/* Request body parsing */
app.use(express.json());

/* Logging */
app.use(morgan('dev'));

/* Localization */
app.use(i18NextSetup);

/* Socket IO */
app.use(cors.default());

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
app.use('/users', userRoutes);
app.use('/matrices', matrixRoutes);
app.use('/sessions', sessionRoutes);

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

export default server;
