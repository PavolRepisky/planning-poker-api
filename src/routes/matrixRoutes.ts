import express from 'express';
import { checkSchema } from 'express-validator';
import matrixController from '../controllers/matrixController';
import authenticateUser from '../middleware/auth/authenticateUser';
import validateSchema from '../middleware/core/validateSchema';
import createUpdateSchema from '../middleware/matrix/createUpdateSchema';
import validateNamelIsAvailable from '../middleware/matrix/validateNameIsAvailable';
import validateOwnership from '../middleware/matrix/validateOwnership';

const matrixRoutes = express.Router();

matrixRoutes.post(
  '/',
  [
    authenticateUser,
    validateSchema(checkSchema(createUpdateSchema)),
    validateNamelIsAvailable,
  ],
  matrixController.create
);

matrixRoutes.patch(
  '/:id(\\d+)/',
  [
    authenticateUser,
    validateSchema(checkSchema(createUpdateSchema)),
    validateNamelIsAvailable,
    validateOwnership,
  ],
  matrixController.update
);

matrixRoutes.get('/', [authenticateUser], matrixController.list);

matrixRoutes.get(
  '/:id(\\d+)/',
  [authenticateUser, validateOwnership],
  matrixController.view
);

matrixRoutes.delete(
  '/:id(\\d+)/',
  [authenticateUser, validateOwnership],
  matrixController.remove
);

export default matrixRoutes;
