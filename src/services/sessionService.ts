import { AttendedSession, Session, Voting } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
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

const joinSession = async (
  sessionHashId: string,
  userId: string
): Promise<void> => {
  try {
    await prisma.attendedSession.create({
      data: {
        sessionHashId,
        userId,
      },
    });
  } catch (err) {
    if (err instanceof PrismaClientKnownRequestError) {
      if (err.code === 'P2002') {
        return;
      }
    }
    throw err;
  }
};

const findUserAttendedSessions = async (
  userId: string
): Promise<AttendedSession[]> => {
  return await prisma.attendedSession.findMany({
    where: {
      userId,
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
  joinSession,
  closeVotings,
  findUserAttendedSessions,
  findVotingsBySessionId,
};
