import express from 'express';
import { uploadSingleImageController } from '~/controllers/medias.controllers';

const mediasRouter = express.Router()

mediasRouter.post('/upload-image', uploadSingleImageController)

export default mediasRouter