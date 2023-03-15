import { NextFunction, Request, Response } from 'express';
import matrixService from '../services/matrixService';
import HttpCode from '../types/core/httpCode';
import MATRIX_NOT_FOUND from '../types/core/matrixNotFound';
import MatrixInfo from '../types/matrix/MatrixInfo';
import parseMatrixValuesToArray from '../utils/matrix/parseMatrixValuesToArray';

const create = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, rows, columns, values } = req.body;
    const decodedToken = res.locals.token;

    const createdMatrix = await matrixService.create(
      name,
      rows,
      columns,
      JSON.stringify(values),
      decodedToken.userId
    );

    res.status(HttpCode.CREATED).json({
      message: req.t('matrix.create.success'),
      data: {
        matrix: {
          id: createdMatrix.id,
          name: createdMatrix.name,
          rows: createdMatrix.rows,
          columns: createdMatrix.columns,
          values: parseMatrixValuesToArray(createdMatrix.values),
        },
      },
    });
  } catch (err: any) {
    next(err);
  }
};

const update = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, rows, columns, values } = req.body;
    const matrixId = Number(req.params.id);

    const updatedMatrix = await matrixService.update(
      matrixId,
      name,
      rows,
      columns,
      JSON.stringify(values)
    );

    res.status(HttpCode.OK).json({
      message: req.t('matrix.update.success'),
      data: {
        matrix: {
          id: updatedMatrix.id,
          name: updatedMatrix.name,
          rows: updatedMatrix.rows,
          columns: updatedMatrix.columns,
          values: parseMatrixValuesToArray(updatedMatrix.values),
        },
      },
    });
  } catch (err: any) {
    next(err);
  }
};

const list = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const decodedToken = res.locals.token;

    const matrices = await matrixService.findByCreatorId(decodedToken.userId);

    const mappedMatrices = matrices.map((matrix) => {
      const { id, name, rows, columns, values } = matrix;
      return {
        id,
        name,
        rows,
        columns,
        values: parseMatrixValuesToArray(values),
      } as MatrixInfo;
    });

    res.status(HttpCode.OK).json({
      message: req.t('matrix.list.success'),
      data: { matrices: mappedMatrices },
    });
  } catch (err: any) {
    next(err);
  }
};

const view = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const matrixId = Number(req.params.id);

    const matrix = await matrixService.findById(matrixId);
    if (matrix === null) {
      throw MATRIX_NOT_FOUND;
    }

    const { id, name, rows, columns, values } = matrix;

    res.status(HttpCode.OK).json({
      message: req.t('matrix.view.success'),
      data: {
        matrix: {
          id,
          name,
          rows,
          columns,
          values: parseMatrixValuesToArray(values),
        } as MatrixInfo,
      },
    });
  } catch (err: any) {
    next(err);
  }
};

const remove = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const matrixId = Number(req.params.id);

    const removedMatrix = await matrixService.deleteById(matrixId);

    res.status(HttpCode.OK).json({
      message: req.t('matrix.remove.success'),
      data: {
        matrix: {
          id: removedMatrix.id,
          name: removedMatrix.name,
          rows: removedMatrix.rows,
          columns: removedMatrix.columns,
          values: parseMatrixValuesToArray(removedMatrix.values),
        },
      },
    });
  } catch (err: any) {
    next(err);
  }
};

export default { create, update, list, view, remove };
