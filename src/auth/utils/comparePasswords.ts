import bcryptjs from 'bcryptjs';
import { INTERNAL_SERVER_ERROR } from '../../core/types/internalServerError';

const comparePasswords = (
  password: string,
  hashedPassword: string
): boolean => {
  try {
    return bcryptjs.compareSync(password, hashedPassword);
  } catch {
    throw INTERNAL_SERVER_ERROR;
  }
};

export default comparePasswords;
