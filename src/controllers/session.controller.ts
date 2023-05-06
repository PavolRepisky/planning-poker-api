import { NextFunction, Request, Response } from 'express';
import {
  CreateSessionInput,
  CreateVotingInput,
} from '../schemas/session.schema';
import { findUniqueMatrix } from '../services/matrix.service';
import {
  createSession,
  createVoting,
  findUniqueSession,
  updateVotings,
} from '../services/session.service';
import HttpCode from '../types/HttpCode';
import SessionData from '../types/SessionData';
import VotingData from '../types/VotingData';
import MATRIX_NOT_FOUND from '../types/errors/MatrixNotFound';
import SESSION_NOT_FOUND from '../types/errors/SessionNotFound';

export const createSessionHandler = async (
  req: Request<{}, {}, CreateSessionInput['body']>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, matrixId } = req.body;
    const user = res.locals.user;

    const matrix = await findUniqueMatrix({ id: matrixId });

    if (!matrix || user.id !== matrix.creatorId) {
      throw MATRIX_NOT_FOUND;
    }

    const session = await createSession({ name, matrixId, ownerId: user.id });

    res.status(HttpCode.CREATED).json({
      message: req.t('session.create.success'),
      data: {
        session: {
          id: session.id,
          name: session.name,
          hashId: session.hashId,
          matrixId: session.matrixId,
          ownerId: session.ownerId,
        } as SessionData,
      },
    });
  } catch (err: any) {
    next(err);
  }
};

export const joinSessionHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { hashId } = req.params;

    const session = await findUniqueSession({ hashId });
    if (!session) {
      throw SESSION_NOT_FOUND;
    }

    const matrix = await findUniqueMatrix({ id: session.matrixId });
    if (!matrix) {
      throw MATRIX_NOT_FOUND;
    }

    res.status(HttpCode.OK).json({
      message: req.t('session.join.success'),
      data: {
        session: {
          id: session.id,
          name: session.name,
          hashId: session.hashId,
          matrixId: session.matrixId,
          ownerId: session.ownerId,
        } as SessionData,
        matrix: {
          id: matrix.id,
          name: matrix.name,
          rows: matrix.rows,
          columns: matrix.columns,
          values: matrix.values,
          createdAt: matrix.createdAt,
        },
      },
    });
  } catch (error: any) {
    next(error);
  }
};

export const createVotingHandler = async (
  req: Request<Record<string, any>, {}, CreateVotingInput['body']>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, description } = req.body;
    const { hashId } = req.params;
    const user = res.locals.user;

    const session = await findUniqueSession({ hashId });
    if (!session || user.id !== session.ownerId) {
      throw SESSION_NOT_FOUND;
    }

    await updateVotings(
      { sessionId: session.id, active: true },
      { active: false }
    );

    const voting = await createVoting({
      name,
      description,
      active: true,
      sessionId: session.id,
    });

    res.status(HttpCode.CREATED).json({
      message: req.t('session.createVoting.success'),
      data: {
        voting: {
          id: voting.id,
          name: voting.name,
          description: voting.description,
          active: voting.active,
        } as VotingData,
      },
    });
  } catch (error: any) {
    next(error);
  }
};
