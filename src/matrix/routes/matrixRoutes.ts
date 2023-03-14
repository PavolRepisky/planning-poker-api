import express from 'express';
import { checkSchema } from 'express-validator';
import authenticateUser from '../../auth/middleware/authenticateUser';
import validateSchema from '../../core/middleware/validateSchema';
import matrixController from '../controllers/matrixController';
import createEditSchema from '../middleware/createEditSchema';
import validateNamelIsAvailable from '../middleware/validateNameIsAvailable';
import validateOwnership from '../middleware/validateOwnership';

const matrixRoutes = express.Router();

matrixRoutes.post(
  '/',
  [
    authenticateUser,
    validateSchema(checkSchema(createEditSchema)),
    validateNamelIsAvailable,
  ],
  matrixController.create
);

matrixRoutes.patch(
  '/:id',
  [
    authenticateUser,
    validateSchema(checkSchema(createEditSchema)),
    validateNamelIsAvailable,
    validateOwnership,
  ],
  matrixController.update
);

matrixRoutes.get('/', [authenticateUser], matrixController.list);

matrixRoutes.get(
  '/:id',
  [authenticateUser, validateOwnership],
  matrixController.view
);

matrixRoutes.delete(
  '/:id',
  [authenticateUser, validateOwnership],
  matrixController.remove
);

export default matrixRoutes;
