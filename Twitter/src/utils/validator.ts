import express from 'express';
import { body, validationResult, ContextRunner, ValidationChain } from 'express-validator';
import { RunnableValidationChains } from 'express-validator/lib/middlewares/schema';

export const validate = (validation: RunnableValidationChains<ValidationChain>) => {
  return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    await validation.run(req); //check error send to request
    const errors = validationResult(req);
    if(errors.isEmpty()) {
    return next();
    }
    res.status(400).json({ errors: errors.mapped() });
  };
};
