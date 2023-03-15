import { User } from '@prisma/client';
import prisma from '../config/client';
import hashPassword from '../utils/auth/hashPassword';

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
