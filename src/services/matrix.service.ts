import { Matrix, Prisma, PrismaClient } from '@prisma/client';
import { parsePrismaJsonToArray } from '../utils/parsePrismaJsonToArray';

const prisma = new PrismaClient();

export const createMatrix = async (input: {
  name: string;
  rows: number;
  columns: number;
  values: string;
  creatorId: string;
}) => {
  const matrix = (await prisma.matrix.create({
    data: input,
  })) as Matrix;

  matrix.values = parsePrismaJsonToArray(matrix.values);
  return matrix;
};

export const updateMatrix = async (
  where: Partial<Prisma.MatrixWhereUniqueInput>,
  data: Prisma.MatrixUpdateInput,
  select?: Prisma.MatrixSelect
) => {
  const matrix = (await prisma.matrix.update({
    where,
    data,
    select,
  })) as Matrix;

  if (matrix.values) {
    matrix.values = parsePrismaJsonToArray(matrix.values);
  }
  return matrix;
};

export const deleteMatrix = async (where: Prisma.MatrixWhereUniqueInput) => {
  const matrix = (await prisma.matrix.delete({
    where,
  })) as Matrix;

  matrix.values = parsePrismaJsonToArray(matrix.values);
  return matrix;
};

export const findMatrices = async (
  where: Partial<Prisma.MatrixWhereInput>,
  select?: Prisma.MatrixSelect
) => {
  const matrices = (await prisma.matrix.findMany({
    where,
    select,
  })) as Matrix[];

  return matrices.map((matrix) => {
    return {
      ...matrix,
      values: matrix.values
        ? parsePrismaJsonToArray(matrix.values)
        : matrix.values,
    };
  });
};

export const findUniqueMatrix = async (
  where: Prisma.MatrixWhereUniqueInput,
  select?: Prisma.MatrixSelect
) => {
  const matrix = (await prisma.matrix.findUnique({
    where,
    select,
  })) as Matrix;

  if (matrix.values) {
    matrix.values = parsePrismaJsonToArray(matrix.values);
  }
  return matrix;
};
