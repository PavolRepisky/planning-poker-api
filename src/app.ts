import config from 'config';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express, { NextFunction, Request, Response } from 'express';
import * as http from 'http';
import morgan from 'morgan';
import SocketServer from './classes/SocketServer';
import authRouter from './routes/auth.routes';
import matrixRouter from './routes/matrix.routes';
import sessionRouter from './routes/session.routes';
import userRouter from './routes/user.routes';
import HttpCode from './types/HttpCode';
import RequestError from './types/errors/RequestError';
import ROUTE_NOT_FOUND from './types/errors/RouteNotFound';
import i18next from './utils/i18next';
import validateEnv from './utils/validateEnv';

dotenv.config();
validateEnv();

const app = express();
export const server = http.createServer(app);
SocketServer.getInstance(server);

/* Template engine */
app.set('view engine', 'pug');
app.set('views', `${__dirname}/views`);

/* Request body parsing */
app.use(express.json({ limit: '10kb' }));

/* Request cookie parsing */
app.use(cookieParser());

/* Cors */
app.use(
  cors({
    origin: [config.get<string>('origin')],
    credentials: true,
  })
);

/* Localization */
app.use(i18next);

/* Logging */
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

/* Routes */
app.use(authRouter);
app.use('/users', userRouter);
app.use('/matrices', matrixRouter);
app.use('/sessions/', sessionRouter);

app.all('*', (req: Request, res: Response, next: NextFunction) => {
  next(ROUTE_NOT_FOUND);
});

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
        message: req.t(err.message),
        errors: err.errors,
      });
    }
    return res.status(HttpCode.INTERNAL_SERVER_ERROR).json({
      message: req.t('common.errors.internal'),
    });
  }
);
