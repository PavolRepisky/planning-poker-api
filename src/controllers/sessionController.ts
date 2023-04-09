import { NextFunction, Request, Response } from 'express';
import matrixService from '../services/matrixService';
import sessionService from '../services/sessionService';
import HttpCode from '../types/core/httpCode';
import MATRIX_NOT_FOUND from '../types/core/matrixNotFound';
import SESSION_NOT_FOUND from '../types/core/sessionNotFound';
import MatrixData from '../types/matrix/MatrixData';
import SessionInfo from '../types/session/SessionInfo';
import VotingInfo from '../types/session/VotingInfo';
import parseMatrixValuesToArray from '../utils/matrix/parseMatrixValuesToArray';

const create = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, matrixId } = req.body;
    const decodedToken = res.locals.token;

    const session = await sessionService.create(
      name,
      matrixId,
      decodedToken.userId
    );

    res.status(HttpCode.CREATED).json({
      message: req.t('session.create.success'),
      data: {
        session: {
          id: session.id,
          name: session.name,
          hashId: session.hashId,
          matrixId: session.matrixId,
        } as SessionInfo,
      },
    });
  } catch (error: any) {
    next(error);
  }
};

const join = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const session = await sessionService.findByHashId(req.params.hashId);
    if (!session) {
      throw SESSION_NOT_FOUND;
    }

    const matrix = await matrixService.findById(session.matrixId);
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
        } as SessionInfo,
        matrix: {
          id: matrix.id,
          name: matrix.name,
          rows: matrix.rows,
          columns: matrix.columns,
          values: parseMatrixValuesToArray(matrix.values),
          createdAt: matrix.createdAt,
        } as MatrixData,
      },
    });
  } catch (error: any) {
    next(error);
  }
};

const createVoting = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name } = req.body;
    const decodedToken = res.locals.token;

    const session = await sessionService.findByHashId(req.params.hashId);
    if (!session || session.ownerId !== decodedToken.userId) {
      throw SESSION_NOT_FOUND;
    }

    await sessionService.closeVotings(session.id);

    const voting = await sessionService.createVoting(name, true, session.id);

    res.status(HttpCode.CREATED).json({
      message: req.t('session.createVoting.success'),
      data: {
        voting: { id: voting.id, name, active: voting.active } as VotingInfo,
      },
    });
  } catch (error: any) {
    next(error);
  }
};

export default { create, join, createVoting };
