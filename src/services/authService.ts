import { User } from '@prisma/client';
import prisma from '../config/client';
import INTERNAL_SERVER_ERROR from '../types/core/internalServerError';
import hashPassword from '../utils/auth/hashPassword';

const createUser = (
  firstName: string,
  lastName: string,
  email: string,
  password: string
): Promise<User> => {
  try {
    return prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashPassword(password),
      },
    });
  } catch {
    throw INTERNAL_SERVER_ERROR;
  }
};

export default {
  createUser,
};
