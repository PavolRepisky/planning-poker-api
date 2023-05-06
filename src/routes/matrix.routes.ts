import express from 'express';

import {
  createMatrixHandler,
  deleteMatrixHandler,
  listMatricesHandler,
  updateMatrixHandler,
  viewMatrixHandler,
} from '../controllers/matrix.controller';
import { deserializeUser } from '../middleware/deserializeUser';
import { requireUser } from '../middleware/requireUser';
import { validate } from '../middleware/validate';
import { createEditSchema } from '../schemas/matrix.schema';

const matrixRouter = express.Router();

matrixRouter.use(deserializeUser, requireUser);

matrixRouter.post('/', validate(createEditSchema), createMatrixHandler);

matrixRouter.patch(
  '/:id(\\d+)/',
  validate(createEditSchema),
  updateMatrixHandler
);

matrixRouter.get('/', listMatricesHandler);

matrixRouter.get('/:id(\\d+)/', viewMatrixHandler);

matrixRouter.delete('/:id(\\d+)/', deleteMatrixHandler);

export default matrixRouter;
