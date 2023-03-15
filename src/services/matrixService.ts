import { Matrix } from '@prisma/client';
import {
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
} from '@prisma/client/runtime';
import prisma from '../config/client';
import MATRIX_NOT_FOUND from '../types/core/matrixNotFound';

const create = (
  name: string,
  rows: number,
  columns: number,
  values: string,
  creatorId: string
): Promise<Matrix> => {
  return prisma.matrix.create({
    data: {
      name,
      rows,
      columns,
      values,
      creatorId,
    },
  });
};

const update = (
  id: number,
  name: string,
  rows: number,
  columns: number,
  values: string
): Promise<Matrix> => {
  try {
    return prisma.matrix.update({
      where: {
        id,
      },
      data: {
        name,
        rows,
        columns,
        values,
      },
    });
  } catch (err: any) {
    if (err instanceof PrismaClientUnknownRequestError) {
      throw MATRIX_NOT_FOUND;
    }
    throw err;
  }
};

const findById = async (id: number): Promise<Matrix | null> => {
  const matrix = await prisma.matrix.findUnique({
    where: {
      id,
    },
  });
  return matrix;
};

const findByName = async (name: string): Promise<Matrix | null> => {
  const matrix = await prisma.matrix.findUnique({
    where: {
      name,
    },
  });
  return matrix;
};

const findByCreatorId = (creatorId: string): Promise<Matrix[]> => {
  return prisma.matrix.findMany({
    where: {
      creatorId,
    },
  });
};

const deleteById = async (id: number): Promise<Matrix> => {
  try {
    return prisma.matrix.delete({
      where: {
        id,
      },
    });
  } catch (err: any) {
    if (err instanceof PrismaClientKnownRequestError) {
      throw MATRIX_NOT_FOUND;
    }
    throw err;
  }
};

export default {
  create,
  update,
  findById,
  findByCreatorId,
  findByName,
  deleteById,
};
