import { Request, Response, NextFunction } from 'express';
import { checkSchema } from 'express-validator';
import { JsonWebTokenError } from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import { bioSchema, confirmPasswordSchema, dateOfBirthSchema, emailSchema, imageSchema, locationSchema, nameSchema, passwordSchema, usernameSchema, websiteSchema } from '~/@types/type.schema';
import { UserVerifyStatus } from '~/constants/enum';
import HTTP_STATUS from '~/constants/httpStatus';
import { USERS_MESSAGES } from '~/constants/message';
import { ErrorWithStatus } from '~/models/Errors';
import { TokenPayload } from '~/models/requests/User.requests';
import databaseService from '~/services/database.services';
import userService from '~/services/users.services';
import { hashPassword } from '~/utils/crypto';
import { verifyToken } from '~/utils/jwt';
import { validate } from '~/utils/validation';

export const loginValidator = validate(checkSchema({
  email: emailSchema,
  password: passwordSchema
}, ['body']))

export const registerValidator = validate(checkSchema({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  confirm_password: confirmPasswordSchema,
  date_of_birth: dateOfBirthSchema
}, ['body']))

export const accessTokenValidator = validate(
  checkSchema(
    {
      authorization: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.ACCESS_TOKEN_IS_REQUIRED
        },
        custom: {
          options: async (value: string, { req }) => {
            const access_token = value.split(' ')[1]
            if (!access_token) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGES.ACCESS_TOKEN_IS_REQUIRED,
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }
            try {
              const decoded_authorization = await verifyToken({ token: access_token, secretOnPublicKey: process.env.JWT_ACCESS_TOKEN_SECRET })
              req.decoded_authorization = decoded_authorization
            } catch (error) {
              if (error instanceof JsonWebTokenError) {
                throw new ErrorWithStatus({
                  message: USERS_MESSAGES.ACCESS_TOKEN_IS_IN_INVAILD,
                  status: HTTP_STATUS.UNAUTHORIZED
                })
              } throw error
            }
            return true
          }
        }
      }
    }, ['headers']))

export const refreshTokenValidator = validate(
  checkSchema({
    refresh_token: {
      notEmpty: {
        errorMessage: USERS_MESSAGES.REFRESH_TOKEN_IS_REQUIRED
      },
      isString: {
        errorMessage: USERS_MESSAGES.REFRESH_TOKEN_MUST_A_STRING
      },
      custom: {
        options: async (value, { req }) => {
          try {
            const [decoded_refresh_token, refresh_token] = await Promise.all([
              verifyToken({ token: value, secretOnPublicKey: process.env.JWT_REFRESH_TOKEN_SECRET }),
              databaseService.refreshTokens.findOne({ token: value })
            ])
            if (refresh_token === null) {
              throw new ErrorWithStatus({ message: USERS_MESSAGES.REFRESH_TOKEN_NOT_EXITS, status: HTTP_STATUS.UNAUTHORIZED })
            }
            req.decoded_refresh_token = decoded_refresh_token
          } catch (error) {
            if (error instanceof JsonWebTokenError) {
              throw new ErrorWithStatus({ message: USERS_MESSAGES.REFRESH_TOKEN_INVALID, status: HTTP_STATUS.UNAUTHORIZED })
            }
            throw error
          }
        }
      }
    }
  }, ['body']))

export const emailVerifyTokenValidator = validate(
  checkSchema({
    email_verify_token: {
      notEmpty: {
        errorMessage: USERS_MESSAGES.EMAIL_VERIFY_TOKEN_IS_REQUIRED
      },
      custom: {
        options: async (value, { req }) => {
          const decoded_email_verify_token = await verifyToken({ token: value, secretOnPublicKey: process.env.JWT_EMAIL_VERIFY_TOKEN_SECRET })
          req.decoded_email_verify_token = decoded_email_verify_token
        }
      }
    }
  }, ['body']))

export const forgotPasswordvalidator = validate(
  checkSchema({
    email: emailSchema
  }, ['body'])
)

export const verifyForgotPasswordTokenValidator = validate(checkSchema({
  forgot_password_token: {
    trim: true,
    notEmpty: {
      errorMessage: USERS_MESSAGES.FORGOT_PASSWORD_TOKEN_IS_REQUIRED
    },
    custom: {
      options: async (value, { req }) => {
        try {
          const decoded_forgot_password_token = await verifyToken({
            token: value,
            secretOnPublicKey: process.env.JWT_SECRET_FORGOT_TOKEN_TOKEN as string,
          })

          const { user_id } = decoded_forgot_password_token
          const user = await databaseService.users.findOne({
            _id: new ObjectId(user_id)
          })
          if (!user) {
            throw new ErrorWithStatus({
              message: USERS_MESSAGES.USER_NOT_FOUND,
              status: HTTP_STATUS.UNAUTHORIZED
            })
          }
          if (user.forgot_password_token !== value) {
            throw new ErrorWithStatus({
              message: USERS_MESSAGES.FORGOT_PASSWORD_TOKEN_IS_INVALID,
              status: HTTP_STATUS.UNAUTHORIZED
            })
          }
        } catch (error) {
          if (error instanceof JsonWebTokenError) {
            throw new ErrorWithStatus({
              message: USERS_MESSAGES.FORGOT_PASSWORD_TOKEN_IS_INVALID
              , status: HTTP_STATUS.UNAUTHORIZED
            })
          }
          throw error
        }
      }
    }
  }
}, ['body']))

export const resetPasswordValidor = validate(
  checkSchema({
    forgot_password_token: {
      trim: true,
      notEmpty: {
        errorMessage: USERS_MESSAGES.FORGOT_PASSWORD_TOKEN_IS_REQUIRED
      },
      custom: {
        options: async (value, { req }) => {
          try {
            const decoded_forgot_password_token = await verifyToken({
              token: value,
              secretOnPublicKey: process.env.JWT_SECRET_FORGOT_TOKEN_TOKEN as string,
            })

            const { user_id } = decoded_forgot_password_token
            const user = await databaseService.users.findOne({
              _id: new ObjectId(user_id)
            })
            if (!user) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGES.USER_NOT_FOUND,
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }
            if (user.forgot_password_token !== value) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGES.FORGOT_PASSWORD_TOKEN_IS_INVALID,
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }
            req.decoded_forgot_password_token = user
          } catch (error) {
            if (error instanceof JsonWebTokenError) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGES.FORGOT_PASSWORD_TOKEN_IS_INVALID
                , status: HTTP_STATUS.UNAUTHORIZED
              })
            }
            throw error
          }
        }
      }
    },
    password: passwordSchema,
    confirm_password: confirmPasswordSchema
  }, ['body'])
)

export const updateMeValidator = validate(
  checkSchema({
    name: {
      ...nameSchema,
      optional: true,
      notEmpty: undefined
    },
    date_of_birth: {
      ...dateOfBirthSchema,
      optional: true,
      notEmpty: undefined
    },
    bio: bioSchema,
    location: locationSchema,
    website: websiteSchema,
    username: usernameSchema,
    avatar: imageSchema,
    cover_photo: imageSchema
  }, ['body'])
)

export const verifiedUserValidator = (req: Request, res: Response, next: NextFunction) => {
  const { verify } = req.decoded_authorization as TokenPayload
  if (verify !== UserVerifyStatus.Verified) {
    return next(new ErrorWithStatus({
      message: USERS_MESSAGES.USER_NOT_VERIFIED,
      status: HTTP_STATUS.FORBIDDEN
    }))
  }
  next()
}

export const followValidator = validate(checkSchema({
  followed_user_id: {
    custom: {
      options: async (value, { req }) => {
        if (!ObjectId.isValid(value)) { // dư ký tự thì lụm ko phải kiểu objectId
          throw new ErrorWithStatus({
            message: USERS_MESSAGES.INVALID_FOLLOW_USER_ID,
            status: HTTP_STATUS.NOTFOUND
          })
        }
        const followed_user = await databaseService.users.findOne({ _id: new ObjectId(value) })
        if (followed_user === null) {
          throw new ErrorWithStatus({
            message: USERS_MESSAGES.USER_NOT_FOUND,
            status: HTTP_STATUS.NOTFOUND
          })
        }
      }
    }
  }
}))