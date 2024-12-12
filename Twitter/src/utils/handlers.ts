import { NextFunction, Request, Response, RequestHandler } from "express";
import { ParamsDictionary } from 'express-serve-static-core'

export const wrapRequestHandler = <T>(func: RequestHandler<ParamsDictionary extends T ? T : any>) => {
  return async (req: Request<T, any, any, any, Record<string, any>>, res: Response, next: NextFunction) => {
    try {
      await func(req, res, next)
    } catch (error) {
      next(error)
    }
  }
}