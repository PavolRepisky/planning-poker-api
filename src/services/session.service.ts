import { Prisma, PrismaClient, Session, Voting } from '@prisma/client';

const prisma = new PrismaClient();

export const createSession = async (input: {
  name: string;
  matrixId: number;
  ownerId: string;
}) => {
  return (await prisma.session.create({
    data: input,
  })) as Session;
};

export const findUniqueSession = async (
  where: Prisma.SessionWhereUniqueInput,
  select?: Prisma.SessionSelect
) => {
  return (await prisma.session.findUnique({
    where,
    select,
  })) as Session;
};

export const createVoting = async (input: {
  name: string;
  description?: string;
  active: boolean;
  sessionId: number;
}) => {
  return (await prisma.voting.create({
    data: input,
  })) as Voting;
};

export const updateVotings = async (
  where: Partial<Prisma.VotingWhereInput>,
  data: Prisma.VotingUpdateInput
) => {
  return await prisma.voting.updateMany({
    where,
    data,
  });
};

export default {
  createSession,
  findUniqueSession,
  createVoting,
  updateVotings,
};
