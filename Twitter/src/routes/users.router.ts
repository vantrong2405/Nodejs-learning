import express from 'express';
import { loginController , registerController } from '~/controllers/users.controllers';
import { loginValidator, registerValidator } from '~/middlewares/userLogin.middlewares';
import { validate } from '~/utils/validator';
const userRouter = express.Router() 
userRouter.use((req, res, next) => {
  next()
})
userRouter.post('/login',loginValidator, loginController);
userRouter.post('/register',registerValidator, registerController);

export default userRouter;