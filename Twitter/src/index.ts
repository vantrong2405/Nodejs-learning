import express from 'express';
import userRouter from './routes/users.router';
import databaseService from './services/database.services';
import { defaultErrorHandler } from '~/middlewares/error.middleware';
import mediasRouter from '~/routes/medias.router';
import { config } from 'dotenv';
import { UPLOAD_DIR, UPLOAD_TEMP_DIR } from '~/constants/dir';
import staticRoutes from '~/routes/statics.router';
import { initFolder } from '~/utils/file';

config()
initFolder(UPLOAD_DIR)
initFolder(UPLOAD_TEMP_DIR)
databaseService.connect()
const app = express();
const port = process.env.PORT || 4000
app.use(express.json());// convert json -> data
app.use('/users', userRouter)
app.use('/medias', mediasRouter)
app.use('/static', staticRoutes)
// app.use('/static', express.static(UPLOAD_DIR))
// default error handler
app.use(defaultErrorHandler)

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
