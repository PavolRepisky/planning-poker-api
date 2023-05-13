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
import { validateSchema } from '../middleware/validateSchema';
import { createEditSchema } from '../schemas/matrix.schema';

const matrixRouter = express.Router();

matrixRouter.use(deserializeUser, requireUser);

matrixRouter.post('/', validateSchema(createEditSchema), createMatrixHandler);

matrixRouter.patch(
  '/:id(\\d+)/',
  validateSchema(createEditSchema),
  updateMatrixHandler
);

matrixRouter.get('/', listMatricesHandler);

matrixRouter.get('/:id(\\d+)/', viewMatrixHandler);

matrixRouter.delete('/:id(\\d+)/', deleteMatrixHandler);

export default matrixRouter;
