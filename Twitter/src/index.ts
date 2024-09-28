import express from 'express';
import userRouter from './routes/users.router';
import databaseService from './services/database.services';
const app = express();

const port = 3000;
app.use(express.json());// convert json -> data
app.use('/users',userRouter)
databaseService.connect()
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
