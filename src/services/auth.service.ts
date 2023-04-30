import { Prisma, User } from '@prisma/client';
import config from 'config';
import { signJwt } from '../utils/jwt';
import prisma from '../utils/prisma';

export const excludedFields = [
  'verified',
  'verificationCode',
  'createdAt',
  'updatedAt',
];

export const createUser = async (input: Prisma.UserCreateInput) => {
  return (await prisma.user.create({
    data: {
      ...input,
      email: input.email.toLowerCase(),
    },
  })) as User;
};

export const removeUser = async (where: Prisma.UserWhereUniqueInput) => {
  return (await prisma.user.delete({
    where: {
      ...where,
      email: where.email?.toLowerCase(),
    },
  })) as User;
};

export const signTokens = async (user: Prisma.UserCreateInput) => {
  const accessToken = signJwt({ userId: user.id }, 'accessTokenKey', {
    expiresIn: `${config.get<number>('accessTokenExpiresIn')}m`,
  });

  const refreshToken = signJwt({ userId: user.id }, 'refreshTokenKey', {
    expiresIn: `${config.get<number>('refreshTokenExpiresIn')}m`,
  });

  return { accessToken, refreshToken };
};
