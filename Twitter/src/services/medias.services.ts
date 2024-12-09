import { Request } from 'express'
import path from 'path'
import sharp from 'sharp'
import fs from 'fs'
import { config } from 'dotenv'
import { getNameFromFUllName, handleUploadImage, handleUploadVideo } from '~/utils/file'
import { File } from 'formidable'
import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_DIR } from '~/constants/dir'
import { isProduction } from '~/utils/config'
import { EncodingStatus, MediaType } from '~/constants/enum'
import { Media } from '~/models/Other'
import { encodeHLSWithMultipleVideoStreams } from '~/utils/video'
import databaseService from '~/services/database.services'
import { VideoStatus } from '~/models/schemas/VideoStatus.schema'

config()

class Queue {
  item: string[] = [];
  encoding: boolean = false;

  // Thêm kiểm tra lỗi cho enqueue và xử lý video
  async enqueue(item: string) {
    try {
      this.item.push(item);
      const nameID = getNameFromFUllName(item.split('/').pop() as string);

      await databaseService.videoStatus.insertOne(
        new VideoStatus({
          name: nameID,
          status: EncodingStatus.Pending
        })
      );
      this.processEncode();
    } catch (error) {
      console.error('Error enqueuing video:', error);
    }
  }

  // Sử dụng vòng lặp thay vì đệ quy để xử lý
  async processEncode() {
    if (this.encoding) return;  // Kiểm tra trạng thái encoding

    while (this.item.length > 0) {
      this.encoding = true;
      const videoPath = this.item[0];
      const nameID = getNameFromFUllName(videoPath.split('/').pop() as string);

      try {
        await databaseService.videoStatus.updateOne(
          { name: nameID },
          {
            $set: { status: EncodingStatus.Processing },
            $currentDate: { updated_at: true }
          }
        );

        await encodeHLSWithMultipleVideoStreams(videoPath);
        this.item.shift();
        await fs.unlinkSync(videoPath);

        await databaseService.videoStatus.updateOne(
          { name: nameID },
          {
            $set: { status: EncodingStatus.Success },
            $currentDate: { updated_at: true }
          }
        );
      } catch (error) {
        console.log('Encode Video Error: ' + error);
        await databaseService.videoStatus.updateOne(
          { name: nameID },
          {
            $set: { status: EncodingStatus.Failed },
            $currentDate: { updated_at: true }
          }
        );
      }
    }

    this.encoding = false;
    if (this.item.length > 0) {
      this.processEncode();  // Lưu ý tránh đệ quy quá mức
    } else {
      console.log('Encode Video Queue Empty');
    }
  }
}

const queue = new Queue()
class MediaService {
  async uploadImage(req: Request) {
    const files = await handleUploadImage(req) // hàm này giúp lưu ảnh ở temp để tiến hành xử lý
    const result: Media[] = await Promise.all(files.map(async (file) => {
      const newName = getNameFromFUllName(file.newFilename) // lấy tên file bỏ đuôi extension để chuẩn bị đổi tên dòng newPath
      const newPath = path.resolve(UPLOAD_IMAGE_DIR, `${newName}.jpg`)// đây là đường dẫn đến file upload
      if (!file.newFilename.toLowerCase().endsWith('.jpg')) {
        await sharp(file.filepath).jpeg().toFile(newPath) // Nếu tệp không phải .jpg, chuyển đổi nó thành .jpg bằng sharp
        fs.unlinkSync(file.filepath)
      } else {
        fs.renameSync(file.filepath, newPath) // Nếu tệp là.jpg, chỉ cần chuyển tệp tạm về đích mà không cần xử lý lại
      }
      return {
        url: isProduction ? `${process.env.HOST}/static/image/${newName}.jpg` : `http://localhost:${process.env.PORT}/static/image/${newName}.jpg`,
        type: MediaType.Image
      }
    }))
    return result
  }
  async uploadVideo(req: Request) {
    const files = await handleUploadVideo(req)
    const { newFilename, filepath } = files[0]
    const newPath = path.resolve(UPLOAD_VIDEO_DIR, `${newFilename}`)
    await fs.promises.rename(filepath, newPath)
    const result = files.map(file => {
      return {
        url: isProduction ? `${process.env.HOST}/static/video/${file.newFilename}` : `http://localhost:${process.env.PORT}/static/video/${file.newFilename}`,
        type: MediaType.Video
      }
    })
    return result
  }
  async uploadVideoHLS(req: Request) {
    const files = await handleUploadVideo(req)
    const result = await Promise.all(
      files.map(async (file) => {
        await encodeHLSWithMultipleVideoStreams(file.filepath)
        return {
          url: isProduction
            ? `${process.env.HOST}/static/video/${file.newFilename}`
            : `http://localhost:${process.env.PORT}/static/video/${file.newFilename}`,
          type: MediaType.HLS
        }
      })
    )
    return result
  }

  async getVideoStatus(id: string) {
    const db = await databaseService.videoStatus.findOne({
      name: id
    })
    return db
  }
}
const mediaService = new MediaService()
export default mediaService