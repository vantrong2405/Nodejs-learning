import { NextFunction, Response, Request } from "express";
import path from "path";
import { initFolder } from "~/utils/file";

const uploadDir = path.resolve('uploads/images')
initFolder(uploadDir)
export const uploadSingleImageController = async (req: Request, res: Response, next: NextFunction) => {
  const formidable = (await import('formidable')).default;
  const form = formidable({
    uploadDir: uploadDir,
    maxFiles: 1,
    keepExtensions: true,
    maxFileSize: 300 * 1024,
  });

  // Xử lý tải tệp
  form.parse(req, (err, fields, files) => {
    if (err) {
      return next(err);
    }

    res.json({
      message: 'Upload image successfully',
      files: files
    });
  });
};
