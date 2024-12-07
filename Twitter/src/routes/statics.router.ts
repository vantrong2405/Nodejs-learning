import { Router } from 'express'
import { serveImageController, serveVideoController } from '~/controllers/medias.controllers'
const staticRoutes = Router()
staticRoutes.get('/image/:name', serveImageController)
staticRoutes.get('/video/:name', serveVideoController)
export default staticRoutes