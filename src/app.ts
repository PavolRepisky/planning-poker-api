import express from 'express';
import morgan from 'morgan';
import i18NextSetup from './core/config/i18n';

export const app = express();

/* Request body parsing */
app.use(express.json());

/* Logging */
app.use(morgan('dev'));

/* Localization */
app.use(i18NextSetup);

/** API Rules */
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'OPTIONS, GET, POST, PUT, PATCH, DELETE'
  );
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

/** Routes */
app.use('/hello', (req, res, next) => {
  res.status(200).send(req.t('test'));
});
