import config from 'config';
import jwt, { SignOptions } from 'jsonwebtoken';

export const signJwt = (
  payload: Object,
  keyName: 'accessTokenKey' | 'refreshTokenKey',
  options: SignOptions
): string => {
  return jwt.sign(payload, config.get<string>(keyName), {
    ...(options && options),
    algorithm: 'HS256',
  });
};

export const verifyJwt = <T>(
  token: string,
  keyName: 'accessTokenKey' | 'refreshTokenKey'
): T | null => {
  try {
    return jwt.verify(token, config.get<string>(keyName)) as T;
  } catch (error) {
    return null;
  }
};
