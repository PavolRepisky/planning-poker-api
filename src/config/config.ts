import dotenv from 'dotenv';

dotenv.config();

const SERVER_HOST = process.env.SERVER_HOST || 'localhost';
const SERVER_TOKEN_EXPIRETIME = Number(
  process.env.SERVER_TOKEN_EXPIRETIME || 3600
);
const SERVER_TOKEN_ISSUER = process.env.SERVER_TOKEN_ISSUER || 'defaultIssuer';
const SERVER_TOKEN_SECRET =
  process.env.SERVER_TOKEN_SECRET || 'superencryptedsecret';
const SERVER_EMAIL = process.env.SERVER_EMAIL ?? '';
const SERVER_PASSWORD = process.env.SERVER_PASSWORD ?? '';

const SERVER = {
  host: SERVER_HOST,
  token: {
    expireTime: SERVER_TOKEN_EXPIRETIME,
    issuer: SERVER_TOKEN_ISSUER,
    secret: SERVER_TOKEN_SECRET,
  },
  bcrypt: {
    salt: 10,
  },
  email: SERVER_EMAIL,
  password: SERVER_PASSWORD,
};

const CLIENT = {
  host: process.env.CLIENT_HOST ?? 'http://localhost:3001',
};

export const oldConfig = {
  server: SERVER,
  client: CLIENT,
};

export default {
  port: Number(process.env.PORT),
  nodeEnv: process.env.NODE_ENV,
};
