import express from 'express';
import { deleteDBController, emailVerifyController, forgetPasswordController, getMeController, loginController, logoutController, registerController, resenVerifyEmailVerifyController, resetpasswordController, updateMeController, verifyForgotPasswordTokenController } from '~/controllers/users.controllers';
import { accessTokenValidator, emailVerifyTokenValidator, forgotPasswordvalidator, loginValidator, refreshTokenValidator, registerValidator, resetPasswordValidor, verifiedUserValidator, verifyForgotPasswordTokenValidator } from '~/middlewares/users.middlewares';
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
userRouter.post('/verify-forgot-password', verifyForgotPasswordTokenValidator, wrapRequestHandler(verifyForgotPasswordTokenController))
userRouter.post('/reset-password', resetPasswordValidor, wrapRequestHandler(resetpasswordController))
userRouter.get('/me', accessTokenValidator, wrapRequestHandler(getMeController))
userRouter.patch('/me', accessTokenValidator, verifiedUserValidator, wrapRequestHandler(updateMeController))
userRouter.get('/delete-db', deleteDBController)
export default userRouter