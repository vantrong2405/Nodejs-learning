import { NextFunction, Response, Request } from "express";
import path from "path";
import { initFolder } from "~/utils/file";

const uploadDir = path.resolve('uploads/images');
initFolder(uploadDir);

export const uploadSingleImageController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const formidable = (await import('formidable')).default;

    const form = formidable({
      uploadDir: uploadDir,
      maxFiles: 1,
      keepExtensions: true,
      maxFileSize: 300 * 1024,
      filter: function ({ name, originalFilename, mimetype }) {
        const valid = name === 'image' && Boolean(mimetype?.includes('image/'))
        if (!valid) {
          form.emit('error' as any, new Error('File is not valid') as any)
        }
        return valid
      }
    });

    // Xử lý tải tệp
    form.parse(req, (err, fields, files) => {
      if (err) {
        return next(err)
      }

      if (!Boolean(files.image)) {
        return next(new Error('File is empty'))
      }

      res.json({
        message: 'Upload image successfully',
        files: files.image
      })
    })
  } catch (err) {
    next(err)
  }
};
