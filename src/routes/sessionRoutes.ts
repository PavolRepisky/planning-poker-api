import express from 'express';
import { checkSchema } from 'express-validator';
import sessionController from '../controllers/sessionController';
import authenticateUser from '../middleware/auth/authenticateUser';
import validateSchema from '../middleware/core/validateSchema';
import createSchema from '../middleware/session/createSchema';
import createVotingSchema from '../middleware/session/createVotingSchema';
import validateMatrixId from '../middleware/session/validateMatrixId';

const sessionRoutes = express.Router();

sessionRoutes.post(
  '/',
  [
    authenticateUser,
    validateSchema(checkSchema(createSchema)),
    validateMatrixId,
  ],
  sessionController.create
);

sessionRoutes.get('/:hashId', sessionController.join);

sessionRoutes.post(
  '/:hashId/voting',
  [authenticateUser, validateSchema(checkSchema(createVotingSchema))],
  sessionController.createVoting
);

export default sessionRoutes;
