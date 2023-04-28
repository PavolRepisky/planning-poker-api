import { Session, Voting } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import prisma from '../config/client';

const create = (
  name: string,
  matrixId: number,
  ownerId: string
): Promise<Session> => {
  return prisma.session.create({
    data: {
      name,
      matrixId,
      ownerId,
    },
  });
};

const findByHashId = async (hashId: string): Promise<Session | null> => {
  return await prisma.session.findUnique({
    where: {
      hashId,
    },
  });
};

const createVoting = (
  name: string,
  description: string | null,
  active: boolean,
  sessionId: number
): Promise<Voting> => {
  return prisma.voting.create({
    data: {
      name,
      description,
      active,
      sessionId,
    },
  });
};

const closeVotings = async (sessionId: number): Promise<number> => {
  const votings = await prisma.voting.updateMany({
    where: {
      sessionId: sessionId,
      active: true,
    },
    data: {
      active: false,
    },
  });
  return votings.count;
};

const findVotingsBySessionId = async (sessionId: number): Promise<Voting[]> => {
  return await prisma.voting.findMany({
    where: {
      sessionId: sessionId,
    },
  });
};

export default {
  create,
  findByHashId,
  createVoting,
  closeVotings,
  findVotingsBySessionId,
};
