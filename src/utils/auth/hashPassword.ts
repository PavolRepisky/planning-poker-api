import bcryptjs from 'bcryptjs';
import config from '../../config/config';
import INTERNAL_SERVER_ERROR from '../../types/core/internalServerError';

const hashPassword = (password: string): string => {
  try {
    return bcryptjs.hashSync(password, config.server.bcrypt.salt);
  } catch {
    throw INTERNAL_SERVER_ERROR;
  }
};

export default hashPassword;