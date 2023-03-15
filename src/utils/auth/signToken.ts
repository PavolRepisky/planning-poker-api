import jwt from 'jsonwebtoken';
import config from '../../config/config';
import INTERNAL_SERVER_ERROR from '../../types/core/internalServerError';

const signToken = (email: string, userId: string): string => {
  try {
    return jwt.sign(
      { email: email, userId: userId },
      config.server.token.secret,
      {
        issuer: config.server.token.issuer,
        algorithm: 'HS256',
        expiresIn: config.server.token.expireTime,
      }
    );
  } catch {
    throw INTERNAL_SERVER_ERROR;
  }
};

export default signToken;
