// Import Express module
import express from 'express';
import userRouter from './routes/users.router';
const app = express();

const port = 3000;
app.use(express.json());// convert json -> data
app.use('/users',userRouter)
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
