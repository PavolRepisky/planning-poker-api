import { Prisma, PrismaClient, User } from '@prisma/client';
import config from 'config';
import { signJwt } from '../utils/jwt';

export const excludedFields = [
  'verified',
  'verificationCode',
  'createdAt',
  'updatedAt',
];

const prisma = new PrismaClient();

export const createUser = async (input: Prisma.UserCreateInput) => {
  return (await prisma.user.create({
    data: input,
  })) as User;
};

export const findUniqueUser = async (
  where: Prisma.UserWhereUniqueInput,
  select?: Prisma.UserSelect
) => {
  return (await prisma.user.findUnique({
    where,
    select,
  })) as User;
};

export const removeUser = async (where: Prisma.UserWhereUniqueInput) => {
  return (await prisma.user.delete({
    where,
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

export const updateUser = async (
  where: Partial<Prisma.UserWhereUniqueInput>,
  data: Prisma.UserUpdateInput,
  select?: Prisma.UserSelect
) => {
  return (await prisma.user.update({ where, data, select })) as User;
};
