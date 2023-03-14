import { Prisma } from '@prisma/client';

const parseMatrixValuesToArray = (values: Prisma.JsonValue): string[][] => {
  return values == null ? [] : JSON.parse(values.toString());
};

export default parseMatrixValuesToArray;
