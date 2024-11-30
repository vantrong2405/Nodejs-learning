import { NextFunction, Request, Response } from "express";
import { RegisterReqBody, TokenPayload } from "~/models/requests/User.requests";
import { ParamsDictionary } from 'express-serve-static-core'
import { ObjectId } from "mongodb";
import User from "~/models/schemas/User.schema";
import { USERS_MESSAGES } from "~/constants/message";
import databaseService from "~/services/database.services";
import HTTP_STATUS from "~/constants/httpStatus";
import userService from "~/services/users.services";
import { UserVerifyStatus } from "~/constants/enum";
export const loginController = async (req: Request, res: Response) => {
  const user = req.user as User
  const user_id = user._id as ObjectId
  const result = await userService.login(user_id.toString())
  res.json({
    message: USERS_MESSAGES.LOGIN_SUCCESS,
    result
  });
}

export const registerController = async (req: Request<ParamsDictionary, any, RegisterReqBody>, res: Response, next: NextFunction) => {
  const result = await userService.register(req.body)
  res.json({
    message: USERS_MESSAGES.REGISTER_SUCCESS,
    result
  });
}

export const logoutController = async (req: Request, res: Response) => {
  const { refresh_token } = req.body
  const result = await userService.logout(refresh_token)
  res.json({
    message: USERS_MESSAGES.LOGOUT_SUCCESS,
    result
  })
}

export const emailVerifyController = async (req: Request, res: Response, next: NextFunction) => {
  const { user_id } = req.decoded_email_verify_token as TokenPayload
  const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })

  if (!user) {
    res.status(HTTP_STATUS.NOTFOUND).json({
      message: USERS_MESSAGES.USER_NOT_FOUND
    })
  }

  if (user?.email_verify_token === '') {
    res.json({
      message: USERS_MESSAGES.EMAIL_ALREADY_VERIFIED
    })
  }
  const result = await userService.verifyEmail(user_id)
  res.json({
    message: USERS_MESSAGES.EMAIL_VERIFY_SUCCESS,
    result
  })
}
export const deleteDBController = async (req: Request, res: Response) => {
  try {
    await databaseService.users.deleteMany({})
    await databaseService.refreshTokens.deleteMany({})
    res.json({
      message: 'Delete DB Success'
    })
  } catch (error) {
    res.json(error)
  }
}

export const resenVerifyEmailVerifyController = async (req: Request, res: Response, next: NextFunction) => {
  const { user_id } = req.decoded_authorization
  const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
  if (!user) {
    res.status(HTTP_STATUS.NOTFOUND).json({
      message: USERS_MESSAGES.USER_NOT_FOUND
    })
    return
  }

  if (user.verify === UserVerifyStatus.Verified) {
    res.json({
      message: USERS_MESSAGES.EMAIL_ALREADY_VERIFY_BEFORE
    })
    return
  }

  await userService.resendVerifyEmail(user_id)
}

export const forgetPasswordController = async (req: Request, res: Response, next: NextFunction) => {
  const { _id } = req.user as User
  const result = await userService.forgotPassword((_id as ObjectId).toString())
  res.json(result)
}