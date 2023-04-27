import { AccountStatus, User } from '@prisma/client';
import { PrismaClientUnknownRequestError } from '@prisma/client/runtime/library';
import prisma from '../config/client';
import USER_NOT_FOUND from '../types/core/userNotFound';
import hashPassword from '../utils/auth/hashPassword';

const findById = async (id: string): Promise<User | null> => {
  const user = await prisma.user.findUnique({
    where: {
      id,
    },
  });
  return user;
};

const findByConfirmationCode = async (
  confirmationCode: string
): Promise<User | null> => {
  const user = await prisma.user.findUnique({
    where: {
      confirmationCode,
    },
  });
  return user;
};

const findByEmail = async (email: string): Promise<User | null> => {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });
  return user;
};

const updatePassword = async (
  id: string,
  password: string
): Promise<User | null> => {
  try {
    const updatedUser = await prisma.user.update({
      where: {
        id,
      },
      data: {
        password: hashPassword(password),
      },
    });
    return updatedUser;
  } catch (err: any) {
    if (err instanceof PrismaClientUnknownRequestError) {
      throw USER_NOT_FOUND;
    }
    throw err;
  }
};

const updateName = async (
  id: string,
  firstName: string,
  lastName: string
): Promise<User | null> => {
  try {
    const updatedUser = await prisma.user.update({
      where: {
        id,
      },
      data: {
        firstName,
        lastName,
      },
    });
    return updatedUser;
  } catch (err: any) {
    if (err instanceof PrismaClientUnknownRequestError) {
      throw USER_NOT_FOUND;
    }
    throw err;
  }
};

const activateAccount = async (id: string): Promise<boolean> => {
  try {
    await prisma.user.update({
      where: {
        id,
      },
      data: {
        accountStatus: AccountStatus.ACTIVE,
      },
    });
    return true;
  } catch {
    return false;
  }
};

export default {
  findById,
  findByConfirmationCode,
  findByEmail,
  updatePassword,
  updateName,
  activateAccount,
};
