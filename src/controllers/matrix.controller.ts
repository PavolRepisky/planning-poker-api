import { Prisma } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import { CreateEditInput } from '../schemas/matrix.schema';
import {
  createMatrix,
  deleteMatrix,
  findMatrices,
  findUniqueMatrix,
  updateMatrix,
} from '../services/matrix.service';
import HttpCode from '../types/HttpCode';
import MatrixData from '../types/MatrixData';
import MATRIX_NOT_FOUND from '../types/errors/MatrixNotFound';
import REQUEST_VALIDATION_ERROR from '../types/errors/RequestValidationError';
import ServerValidationError from '../types/errors/ServerValidationError';

export const createMatrixHandler = async (
  req: Request<{}, {}, CreateEditInput['body']>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, rows, columns, values } = req.body;
    const user = res.locals.user;

    const matrix = await createMatrix({
      name: name.toLowerCase(),
      rows: +rows,
      columns: +columns,
      values: JSON.stringify(values),
      creatorId: user.id,
    });

    res.status(HttpCode.CREATED).json({
      message: req.t('matrix.create.success'),
      data: {
        matrix: {
          id: matrix.id,
          name: matrix.name,
          rows: matrix.rows,
          columns: matrix.columns,
          values: matrix.values,
          createdAt: matrix.createdAt,
        } as MatrixData,
      },
    });
  } catch (err: any) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2002') {
        const errors: ServerValidationError[] = [
          {
            path: 'name',
            location: 'body',
            value: req.body.name,
            message: req.t('common.validations.matrix.taken'),
          },
        ];
        return next(REQUEST_VALIDATION_ERROR(errors));
      }
    }
    next(err);
  }
};

export const updateMatrixHandler = async (
  req: Request<Record<string, any>, {}, CreateEditInput['body']>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, rows, columns, values } = req.body;
    const user = res.locals.user;
    const id = Number(req.params.id);

    const matrix = await findUniqueMatrix(
      { id },
      { name: true, creatorId: true }
    );

    if (!matrix || matrix.creatorId != user.id) {
      throw MATRIX_NOT_FOUND;
    }

    const updatedMatrix = await updateMatrix(
      { id },
      {
        name: name.toLowerCase(),
        rows: +rows,
        columns: +columns,
        values: JSON.stringify(values),
      }
    );

    res.status(HttpCode.OK).json({
      message: req.t('matrix.edit.success'),
      data: {
        matrix: {
          id: updatedMatrix.id,
          name: updatedMatrix.name,
          rows: updatedMatrix.rows,
          columns: updatedMatrix.columns,
          values: updatedMatrix.values,
          createdAt: updatedMatrix.createdAt,
        } as MatrixData,
      },
    });
  } catch (err: any) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2002') {
        const errors: ServerValidationError[] = [
          {
            path: 'name',
            location: 'body',
            value: req.body.name,
            message: req.t('common.validations.matrix.taken'),
          },
        ];
        return next(REQUEST_VALIDATION_ERROR(errors));
      }
    }
    next(err);
  }
};

export const listMatricesHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = res.locals.user;

    const matrices = await findMatrices({ creatorId: user.id });

    const matricesData = matrices.map((matrix) => {
      const { id, name, rows, columns, values, createdAt } = matrix;
      return {
        id,
        name,
        rows,
        columns,
        values,
        createdAt,
      } as MatrixData;
    });

    res.status(HttpCode.OK).json({
      message: req.t('matrix.list.success'),
      data: { matrices: matricesData },
    });
  } catch (err: any) {
    next(err);
  }
};

export const viewMatrixHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const user = res.locals.user;

    const matrix = await findUniqueMatrix({ id });

    if (!matrix || user.id !== matrix.creatorId) {
      throw MATRIX_NOT_FOUND;
    }

    res.status(HttpCode.OK).json({
      message: req.t('matrix.view.success'),
      data: {
        matrix: {
          id: matrix.id,
          name: matrix.name,
          rows: matrix.rows,
          columns: matrix.columns,
          values: matrix.values,
          createdAt: matrix.createdAt,
        } as MatrixData,
      },
    });
  } catch (err: any) {
    next(err);
  }
};

export const deleteMatrixHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const user = res.locals.user;

    const matrix = await findUniqueMatrix({ id });

    if (!matrix || user.id !== matrix.creatorId) {
      throw MATRIX_NOT_FOUND;
    }

    const removedMatrix = await deleteMatrix({ id });

    res.status(HttpCode.OK).json({
      message: req.t('matrix.remove.success'),
      data: {
        matrix: {
          id: removedMatrix.id,
          name: removedMatrix.name,
          rows: removedMatrix.rows,
          columns: removedMatrix.columns,
          values: removedMatrix.values,
          createdAt: removedMatrix.createdAt,
        } as MatrixData,
      },
    });
  } catch (err: any) {
    next(err);
  }
};
