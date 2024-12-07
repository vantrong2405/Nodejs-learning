import { Router } from 'express'
import { serveImageController, serveVideoStreamController } from '~/controllers/medias.controllers'
const staticRoutes = Router()
staticRoutes.get('/image/:name', serveImageController)
staticRoutes.get('/video-stream/:name', serveVideoStreamController)
export default staticRoutes

