import { NextFunction, Request, Response } from 'express';
import { ValidationError } from 'express-validator';
import matrixService from '../../services/matrixService';
import INTERNAL_SERVER_ERROR from '../../types/errors/InternalServerError';
import REQUEST_VALIDATION_ERROR from '../../types/errors/RequestValidationError';

const validateNamelIsAvailable = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name } = req.body;
    const decodedToken = res.locals.token;
    const editMode = req.method === 'PATCH';

    const userMatrices = await matrixService.findByCreatorId(
      decodedToken.userId
    );
    const matrixWithSameName = userMatrices.find(
      (matrix) => matrix.name === name
    );

    if (
      matrixWithSameName &&
      (!editMode || matrixWithSameName.id != Number(req.params?.id))
    ) {
      const validationError = {
        value: name,
        msg: req.t('common.validations.uniqueName'),
        param: 'name',
        location: 'body',
      } as ValidationError;
      return next(REQUEST_VALIDATION_ERROR([validationError]));
    }
    next();
  } catch (err) {
    next(INTERNAL_SERVER_ERROR);
  }
};

export default validateNamelIsAvailable;
