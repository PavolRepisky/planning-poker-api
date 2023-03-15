import express from 'express';
import { checkSchema } from 'express-validator';
import matrixController from '../controllers/matrixController';
import authenticateUser from '../middleware/auth/authenticateUser';
import validateSchema from '../middleware/core/validateSchema';
import createEditSchema from '../middleware/matrix/createEditSchema';
import validateNamelIsAvailable from '../middleware/matrix/validateNameIsAvailable';
import validateOwnership from '../middleware/matrix/validateOwnership';

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
