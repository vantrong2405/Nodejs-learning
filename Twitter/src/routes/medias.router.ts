import express from 'express';
import { uploadImageController } from '~/controllers/medias.controllers';
import { wrapRequestHandler } from '~/utils/handlers';

const mediasRouter = express.Router()

mediasRouter.post('/upload-image', wrapRequestHandler(uploadImageController))

export default mediasRouter