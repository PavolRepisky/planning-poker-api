import { Session, Voting } from '@prisma/client';
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
  const session = await prisma.session.findUnique({
    where: {
      hashId,
    },
  });
  return session;
};

const createVoting = (
  name: string,
  active: boolean,
  sessionId: number
): Promise<Voting> => {
  return prisma.voting.create({
    data: {
      name,
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

export default {
  create,
  findByHashId,
  createVoting,
  closeVotings,
};
