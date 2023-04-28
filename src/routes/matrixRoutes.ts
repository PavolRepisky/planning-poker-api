import express from 'express';
import { checkSchema } from 'express-validator';
import matrixController from '../controllers/matrixController';
import userAuthentication from '../middleware/auth/userAuthentication';
import createUpdateSchema from '../middleware/matrix/createUpdateSchema';
import validateNamelIsAvailable from '../middleware/matrix/validateNameIsAvailable';
import validateOwnership from '../middleware/matrix/validateOwnership';
import validateSchema from '../middleware/validateSchema';

const matrixRoutes = express.Router();

matrixRoutes.post(
  '/',
  [
    userAuthentication.authenticate,
    validateSchema(checkSchema(createUpdateSchema)),
    validateNamelIsAvailable,
  ],
  matrixController.create
);

matrixRoutes.patch(
  '/:id(\\d+)/',
  [
    userAuthentication.authenticate,
    validateSchema(checkSchema(createUpdateSchema)),
    validateNamelIsAvailable,
    validateOwnership,
  ],
  matrixController.update
);

matrixRoutes.get('/', [userAuthentication.authenticate], matrixController.list);

matrixRoutes.get(
  '/:id(\\d+)/',
  [userAuthentication.authenticate, validateOwnership],
  matrixController.view
);

matrixRoutes.delete(
  '/:id(\\d+)/',
  [userAuthentication.authenticate, validateOwnership],
  matrixController.remove
);

export default matrixRoutes;
