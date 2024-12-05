import { NextFunction, Response, Request } from "express";
import { File } from "formidable";
import path from "path";
import { UPLOAD_DIR, UPLOAD_TEMP_DIR } from "~/constants/dir";
import mediaService from "~/services/medias.services";
import { handleUploadImage, initFolder } from "~/utils/file";

initFolder(UPLOAD_DIR)
initFolder(UPLOAD_TEMP_DIR)

export const uploadSingleImageController = async (req: Request, res: Response, next: NextFunction) => {
  const result = await mediaService.handleUploadSingleImage(req);
  res.json({
    result
  })
};
