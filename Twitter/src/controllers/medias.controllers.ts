import { NextFunction, Response, Request } from "express";
import path from "path";
import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_DIR, UPLOAD_VIDEO_TEMP_DIR } from "~/constants/dir";
import HTTP_STATUS from "~/constants/httpStatus";
import { USERS_MESSAGES } from "~/constants/message";
import mediaService from "~/services/medias.services";

export const uploadImageController = async (req: Request, res: Response, next: NextFunction) => {
  const url = await mediaService.uploadImage(req);
  res.json({
    message: USERS_MESSAGES.UPLOAD_IMAGE_SUCCESS,
    result: url
  })
}

export const uploadVideoController = async (req: Request, res: Response, next: NextFunction) => {
  const url = await mediaService.uploadVideo(req);
  res.json({
    message: USERS_MESSAGES.UPLOAD_VIDEO_SUCCESS,
    result: url
  })
};

export const serveImageController = (req: Request, res: Response, next: NextFunction) => {
  const { name } = req.params
  return res.sendFile(path.resolve(UPLOAD_IMAGE_DIR, name), (err) => {
    if (err) {
      res.status((err as any).status).json({
        message: USERS_MESSAGES.VIDEO_NOT_FOUND
      })
    }
  })
}
export const serveVideoController = (req: Request, res: Response, next: NextFunction) => {
  const { name } = req.params
  return res.sendFile(path.resolve(UPLOAD_VIDEO_DIR, name), (err) => {
    if (err) {
      if (!res.headersSent) {
        res.status((err as any).status).json({
          message: USERS_MESSAGES.VIDEO_NOT_FOUND
        });
      }
    }
  })
}


