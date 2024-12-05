import { Request } from 'express'
import path from 'path'
import sharp from 'sharp'
import fs from 'fs'
import { config } from 'dotenv'
import { getNameFromFUllName, handleUploadImage } from '~/utils/file'
import { File } from 'formidable'
import { UPLOAD_DIR } from '~/constants/dir'
import { isProduction } from '~/utils/config'

config()
class MediaService {
  async handleUploadSingleImage(req: Request) {
    const file = await handleUploadImage(req) // hàm này giúp lưu ảnh ở temp để tiến hành xử lý
    const newName = getNameFromFUllName(file.newFilename) // lấy tên file bỏ đuôi extension để chuẩn bị đổi tên dòng newPath
    const newPath = path.resolve(UPLOAD_DIR, `${newName}.jpg`)// đây là đường dẫn đến file upload
    await sharp((file as File).filepath).jpeg().toFile(newPath) // khi upload xong thì chuyển vào vào upload và lưu format jpg
    fs.unlinkSync(file.filepath) // xóa ở temp
    return isProduction ? `${process.env.HOST}/static/media/${newName}.jpg`
      : `http://localhost:${process.env.PORT}/static/image/${newName}.jpg`
  }
}
const mediaService = new MediaService()
export default mediaService