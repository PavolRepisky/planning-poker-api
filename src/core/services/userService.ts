import { User } from '@prisma/client';
import prisma from '../../core/config/client';

const findUserById = async (id: string): Promise<User | null> => {
  const user = await prisma.user.findUnique({
    where: {
      id,
    },
  });
  return user;
};

const findUserByEmail = async (email: string): Promise<User | null> => {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });
  return user;
};

export default {
  findUserById,
  findUserByEmail,
};
