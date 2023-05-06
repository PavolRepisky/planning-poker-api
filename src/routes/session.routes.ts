import express from 'express';
import {
  createSessionHandler,
  createVotingHandler,
  joinSessionHandler,
} from '../controllers/session.controller';
import { deserializeUser } from '../middleware/deserializeUser';
import { requireUser } from '../middleware/requireUser';
import { validate } from '../middleware/validate';
import {
  createSessionSchema,
  createVotingSchema,
} from '../schemas/session.schema';

const sessionRouter = express.Router();

sessionRouter.post(
  '/',
  deserializeUser,
  requireUser,
  validate(createSessionSchema),
  createSessionHandler
);

sessionRouter.get('/:hashId', joinSessionHandler);

sessionRouter.post(
  '/:hashId/voting',
  deserializeUser,
  requireUser,
  validate(createVotingSchema),
  createVotingHandler
);

export default sessionRouter;
