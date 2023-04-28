import jwt from 'jsonwebtoken';
import {oldConfig} from '../../config/config';
import INTERNAL_SERVER_ERROR from '../../types/core/internalServerError';

const signToken = (email: string, userId: string): string => {
  try {
    return jwt.sign(
      { email: email, userId: userId },
      oldConfig.server.token.secret,
      {
        issuer: oldConfig.server.token.issuer,
        algorithm: 'HS256',
        expiresIn: oldConfig.server.token.expireTime,
      }
    );
  } catch {
    throw INTERNAL_SERVER_ERROR;
  }
};

export default signToken;
