import path from "path"
import fs from "fs";
import { UPLOAD_DIR, UPLOAD_TEMP_DIR } from "~/constants/dir";
import formidable, { File } from "formidable";

export const initFolder = (pathFolder: string) => {
  const uploadDir = path.resolve(pathFolder)
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true })
  }
}

export const handleUploadImage = async (req: any) => {
  const form = formidable({
    uploadDir: UPLOAD_TEMP_DIR,
    maxFiles: 4,
    keepExtensions: true,
    maxFileSize: 300 * 1024,
    maxFieldsSize: 300 * 1024 * 4,
    filter: function ({ name, originalFilename, mimetype }) {
      const valid = name === 'image' && Boolean(mimetype?.includes('image/'))
      if (!valid) {
        form.emit('error' as any, new Error('File is not valid') as any)
      }
      return valid
    }
  })

  return new Promise<File[]>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err)
      if (!Boolean(files.image)) return reject(new Error('File is empty'))
      resolve(files.image as File[])
    })
  })
}

export const getNameFromFUllName = (fullName: string) => {
  const namearr = fullName.split('.')
  namearr.pop()
  return namearr.join('.')
}