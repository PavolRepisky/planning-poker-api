import matrixService from '../services/matrixService';
import MatrixData from '../types/matrix/MatrixData';
import parseMatrixValuesToArray from '../utils/matrix/parseMatrixValuesToArray';

const generateTestMatrix = async (
  name: string,
  rows: number,
  columns: number,
  values: string[][],
  creatorId: string
) => {
  const matrix = await matrixService.create(
    name,
    rows,
    columns,
    JSON.stringify(values),
    creatorId
  );

  return {
    id: matrix.id,
    name: matrix.name,
    rows: matrix.rows,
    columns: matrix.columns,
    values: parseMatrixValuesToArray(matrix.values),
    createdAt: matrix.createdAt,
  } as MatrixData;
};

export default { generateTestMatrix };
