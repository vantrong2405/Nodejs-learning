import express from 'express';
import userRouter from './routes/users.router';
import databaseService from './services/database.services';
import { defaultErrorHandler } from '~/middlewares/error.middleware';
databaseService.connect()
const app = express();
const port = 4000;
app.use(express.json());// convert json -> data
app.use('/users',userRouter)

// default error handler
app.use(defaultErrorHandler) 

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
