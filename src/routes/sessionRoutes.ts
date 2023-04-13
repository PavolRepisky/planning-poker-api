import express from 'express';
import { checkSchema } from 'express-validator';
import sessionController from '../controllers/sessionController';
import userAuthentication from '../middleware/auth/userAuthentication';
import validateSchema from '../middleware/core/validateSchema';
import authenticateLoggedUser from '../middleware/session/authenticateLoggedUser';
import createSchema from '../middleware/session/createSchema';
import createVotingSchema from '../middleware/session/createVotingSchema';
import validateMatrixId from '../middleware/session/validateMatrixId';
import validateSessionId from '../middleware/session/validateSessionId';
import validateOwnership from '../middleware/session/validateOwnership';

const sessionRoutes = express.Router();

sessionRoutes.post(
  '/',
  [
    userAuthentication.authenticate,
    validateSchema(checkSchema(createSchema)),
    validateMatrixId,
  ],
  sessionController.create
);

sessionRoutes.get(
  '/:hashId',
  [validateSessionId, authenticateLoggedUser],
  sessionController.join
);

sessionRoutes.post(
  '/:hashId/voting',
  [
    userAuthentication.authenticate,
    validateSchema(checkSchema(createVotingSchema)),
    validateOwnership
  ],
  sessionController.createVoting
);

export default sessionRoutes;
