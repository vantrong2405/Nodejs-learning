import path from "path"
import fs from "fs";

export const initFolder = (pathFolder: string) => {
  const uploadDir = path.resolve(pathFolder)
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true })
  }
}