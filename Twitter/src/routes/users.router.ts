import express from 'express';
import { loginController } from '~/controllers/users.controllers';
import { loginValidator } from '~/middlewares/userLogin.middlewares';
const userRouter = express.Router() 
userRouter.use((req, res, next) => {
  next()
})
userRouter.post('/login', loginValidator, loginController);

export default userRouter;