import { Request } from 'express'
import path from 'path'
import sharp from 'sharp'
import fs from 'fs'
import { config } from 'dotenv'
import { getNameFromFUllName, handleUploadImage } from '~/utils/file'
import { File } from 'formidable'
import { UPLOAD_DIR } from '~/constants/dir'
import { isProduction } from '~/utils/config'
import { MediaType } from '~/constants/enum'
import { Media } from '~/models/Other'

config()
class MediaService {
  async uploadImage(req: Request) {
    const files = await handleUploadImage(req) // hàm này giúp lưu ảnh ở temp để tiến hành xử lý
    const result: Media[] = await Promise.all(files.map(async (file) => {
      const newName = getNameFromFUllName(file.newFilename) // lấy tên file bỏ đuôi extension để chuẩn bị đổi tên dòng newPath
      const newPath = path.resolve(UPLOAD_DIR, `${newName}.jpg`)// đây là đường dẫn đến file upload
      if (file.newFilename.toLowerCase().endsWith('.jpg')) {
        await fs.promises.rename(file.filepath, newPath) // Nếu tệp là .jpg, chỉ cần chuyển tệp tạm về đích mà không cần xử lý lại
      } else {
        await sharp(file.filepath).jpeg().toFile(newPath) // Nếu tệp không phải .jpg, chuyển đổi nó thành .jpg bằng sharp
      }
      fs.unlinkSync(file.filepath) // xóa ở temp
      return {
        url: isProduction ? `${process.env.HOST}/static/image/${newName}.jpg` : `http://localhost:${process.env.PORT}/static/image/${newName}.jpg`,
        type: MediaType.Image
      }
    }))
    return result
  }
}
const mediaService = new MediaService()
export default mediaService