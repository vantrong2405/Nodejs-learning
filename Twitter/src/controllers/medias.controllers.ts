import { NextFunction, Response, Request } from "express";
import path from "path";
import { UPLOAD_DIR } from "~/constants/dir";
import HTTP_STATUS from "~/constants/httpStatus";
import { USERS_MESSAGES } from "~/constants/message";
import mediaService from "~/services/medias.services";

export const uploadImageController = async (req: Request, res: Response, next: NextFunction) => {
  const url = await mediaService.uploadImage(req);
  res.json({
    message: USERS_MESSAGES.UPLOAD_IMAGE_SUCCESS,
    result: url
  })
};

export const serveImageController = (req: Request, res: Response, next: NextFunction) => {
  const { name } = req.params
  return res.sendFile(path.resolve(UPLOAD_DIR, name), (err) => {
    if (err) {
      res.status(HTTP_STATUS.NOTFOUND).json({
        message: USERS_MESSAGES.IMAGE_NOT_FOUND
      })
    }
  })
}

