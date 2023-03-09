import { User } from '@prisma/client';
import prisma from '../../core/config/client';
import hashPassword from '../utils/hashPassword';

const createUser = (
  firstName: string,
  lastName: string,
  email: string,
  password: string
): Promise<User> => {
  return prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      password: hashPassword(password),
    },
  });
};

export default {
  createUser,
};
