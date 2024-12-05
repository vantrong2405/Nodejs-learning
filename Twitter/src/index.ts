import express from 'express';
import userRouter from './routes/users.router';
import databaseService from './services/database.services';
import { defaultErrorHandler } from '~/middlewares/error.middleware';
import mediasRouter from '~/routes/medias.router';
databaseService.connect()
const app = express();
const port = 4000;
app.use(express.json());// convert json -> data
app.use('/users', userRouter)
app.use('/medias', mediasRouter)

// default error handler
app.use(defaultErrorHandler)

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
