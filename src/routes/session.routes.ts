import express from 'express';
import {
  createSessionHandler,
  createVotingHandler,
  joinSessionHandler,
} from '../controllers/session.controller';
import { deserializeUser } from '../middleware/deserializeUser';
import { requireUser } from '../middleware/requireUser';
import { validateSchema } from '../middleware/validateSchema';
import {
  createSessionSchema,
  createVotingSchema,
} from '../schemas/session.schema';

const sessionRouter = express.Router();

sessionRouter.post(
  '/',
  deserializeUser,
  requireUser,
  validateSchema(createSessionSchema),
  createSessionHandler
);

sessionRouter.get('/:hashId', joinSessionHandler);

sessionRouter.post(
  '/:hashId/voting',
  deserializeUser,
  requireUser,
  validateSchema(createVotingSchema),
  createVotingHandler
);

export default sessionRouter;
