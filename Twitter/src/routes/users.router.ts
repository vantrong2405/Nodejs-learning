import express from 'express';
import { loginController, logoutController, registerController } from '~/controllers/users.controllers';
import { accessTokenValidator, loginValidator, refreshTokenValidator, registerValidator } from '~/middlewares/users.middlewares';
import { wrapRequestHandler } from '~/utils/handlers';
const userRouter = express.Router()
userRouter.use((req, res, next) => {
  next()
})
userRouter.post('/login', loginValidator, wrapRequestHandler(loginController));
userRouter.post('/register', registerValidator, wrapRequestHandler(registerController));
userRouter.post('/logout', accessTokenValidator, refreshTokenValidator, wrapRequestHandler(logoutController));

export default userRouter;