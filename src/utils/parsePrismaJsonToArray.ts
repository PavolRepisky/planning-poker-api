import { Prisma } from '@prisma/client';

export const parsePrismaJsonToArray = (values: Prisma.JsonValue): string[][] => {
  return values == null ? [] : JSON.parse(values.toString());
};
