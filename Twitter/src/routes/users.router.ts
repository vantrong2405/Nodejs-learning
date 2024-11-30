import express from 'express';
import { deleteDBController, emailVerifyController, forgetPasswordController, loginController, logoutController, registerController, resenVerifyEmailVerifyController } from '~/controllers/users.controllers';
import { accessTokenValidator, emailVerifyTokenValidator, forgotPasswordvalidator, loginValidator, refreshTokenValidator, registerValidator } from '~/middlewares/users.middlewares';
import { wrapRequestHandler } from '~/utils/handlers';
const userRouter = express.Router()
userRouter.use((req, res, next) => {
  next()
})
userRouter.post('/login', loginValidator, wrapRequestHandler(loginController))
userRouter.post('/register', registerValidator, wrapRequestHandler(registerController))
userRouter.post('/logout', accessTokenValidator, refreshTokenValidator, wrapRequestHandler(logoutController))
userRouter.post('/verify-email', emailVerifyTokenValidator, wrapRequestHandler(emailVerifyController))
userRouter.post('/resend-verify-email', accessTokenValidator, wrapRequestHandler(resenVerifyEmailVerifyController))
userRouter.post('/forgot-password', forgotPasswordvalidator, wrapRequestHandler(forgetPasswordController))
userRouter.get('/delete-db', deleteDBController)
export default userRouter