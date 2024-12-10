import express from 'express';
import userRouter from './routes/users.router';
import databaseService from './services/database.services';
import { defaultErrorHandler } from '~/middlewares/error.middleware';
import mediasRouter from '~/routes/medias.router';
import { config } from 'dotenv';
import { UPLOAD_IMAGE_DIR, UPLOAD_IMAGE_TEMP_DIR, UPLOAD_VIDEO_DIR, UPLOAD_VIDEO_TEMP_DIR } from '~/constants/dir';
import staticRoutes from '~/routes/statics.router';
import { initFolder } from '~/utils/file';
import TweetRouter from '~/routes/tweets.router';
import bookmarkRouter from '~/routes/bookmarks.router';
import likeRouter from '~/routes/likes.router';

config()
initFolder(UPLOAD_IMAGE_DIR)
initFolder(UPLOAD_IMAGE_TEMP_DIR)
initFolder(UPLOAD_VIDEO_DIR)
initFolder(UPLOAD_VIDEO_TEMP_DIR)
// databaseService.connect()
//   .then(() => {
//     databaseService.indexeUser()
//     databaseService.indexRefreshToken()
//     databaseService.indexVideoStatus()
//     databaseService.indexFollowers()
//   })
const app = express();
const port = process.env.PORT || 4000
app.use(express.json());// convert json -> data
app.use('/users', userRouter)
app.use('/medias', mediasRouter)
app.use('/static', staticRoutes)
app.use('/static/video', express.static(UPLOAD_VIDEO_DIR)) // tự độn phục vụ cho các tệp chứa trong UPLOAD_VIDEO_DIR. nếu name video có trong folder này
app.use('/tweet', TweetRouter)
app.use('/bookmarks', bookmarkRouter)
app.use('/likes', likeRouter)
// default error handler
app.use(defaultErrorHandler)

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
