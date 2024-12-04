import User from "~/models/schemas/User.schema";
import databaseService from "./database.services";
import { followersReqBody, RegisterReqBody, UpdateMeReqBody } from "~/models/requests/User.requests";
import { hashPassword } from "~/utils/crypto";
import { signToken } from "~/utils/jwt";
import { TokenType, UserVerifyStatus } from "~/constants/enum";
import RefreshToken from "~/models/schemas/RefreshToken.schema";
import { ObjectId } from "mongodb";
import { config } from "dotenv";
import { USERS_MESSAGES } from "~/constants/message";
import Follower from "~/models/schemas/Follower.schema";
config()
class UserService {
  private signAccessToken({ user_id, verify }: { user_id: string, verify: UserVerifyStatus }) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.AccessToken,
        verify
      },
      privateKey: process.env.JWT_ACCESS_TOKEN_SECRET as string,
      options: {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN
      }
    })
  }
  private signRefreshToken({ user_id, verify }: { user_id: string, verify: UserVerifyStatus }) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.RefreshToken,
        verify
      },
      privateKey: process.env.JWT_REFRESH_TOKEN_SECRET as string,
      options: {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN
      }
    })
  }

  private signAccessAndRefreshToken({ user_id, verify }: { user_id: string, verify: UserVerifyStatus }) {
    return Promise.all([ // ko phụ thuộc vào name lấy
      this.signAccessToken({ user_id, verify }),
      this.signRefreshToken({ user_id, verify })
    ])
  }
  async register(payload: RegisterReqBody) {
    const user_id = new ObjectId()
    const email_verify_token = await this.signEmailVerifyToken({ user_id: user_id.toString(), verify: UserVerifyStatus.Unverified })
    const result = await databaseService.users.insertOne(
      new User({
        ...payload,
        _id: user_id,
        date_of_birth: new Date(payload.date_of_birth), //convert ISO -> date
        password: hashPassword(payload.password),
        email_verify_token
      })
    )

    const [access_token, refresh_token] = await this.signAccessAndRefreshToken({ user_id: user_id.toString(), verify: UserVerifyStatus.Unverified })
    await databaseService.refreshTokens.insertOne(new RefreshToken({ user_id: new ObjectId(user_id), token: refresh_token }))

    return {
      access_token,// trả về cả trường vẫn value là access_token và refresh_token 
      refresh_token,
    }
  }

  async checkEmailExist(email: string) {
    const user = await databaseService.users.findOne({ email })
    return Boolean(user)
  }

  async login({ user_id, verify }: { user_id: string, verify: UserVerifyStatus }) {
    const [access_token, refresh_token] = await this.signAccessAndRefreshToken({ user_id, verify })
    await databaseService.refreshTokens.insertOne(new RefreshToken({ user_id: new ObjectId(user_id), token: refresh_token }))

    return {
      access_token,// trả về cả trường vẫn value là access_token và refresh_token 
      refresh_token,
    }
  }

  async logout(refresh_token: string) {
    await databaseService.refreshTokens.deleteOne({ token: refresh_token })
    return {
      message: USERS_MESSAGES.LOGOUT_SUCCESS
    }
  }

  async verifyEmail(user_id: string) {
    const [token] = await Promise.all([
      this.signAccessAndRefreshToken({ user_id, verify: UserVerifyStatus.Verified }),
      databaseService.users.updateOne(
        {
          _id: new ObjectId(user_id)
        },
        {
          $set: {
            email_verify_token: '',
            verify: UserVerifyStatus.Verified
          },
          $currentDate: {
            updated_at: true
          }
        }
      )
    ])
    const [access_token, refresh_token] = token
    return {
      access_token,
      refresh_token
    }
  }

  async resendVerifyEmail(user_id: string) {
    const email_verify_token = await this.signEmailVerifyToken({ user_id, verify: UserVerifyStatus.Unverified })
    databaseService.users.updateOne(
      {
        _id: new ObjectId(user_id)
      },
      {
        $set: {
          email_verify_token: '',
          verify: UserVerifyStatus.Verified
        },
        $currentDate: {
          updated_at: true
        }
      }
    )
    return {
      message: USERS_MESSAGES.RESEND_VERIFY_EMAIL_SUCCESS
    }

  }
  private signEmailVerifyToken({ user_id, verify }: { user_id: string, verify: UserVerifyStatus }) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.RefreshToken,
        verify
      },
      privateKey: process.env.JWT_EMAIL_VERIFY_TOKEN_SECRET as string,
      options: {
        expiresIn: process.env.EMAIL_VERIFY_TOKEN_EXPIRE_IN
      }
    })
  }
  private signForgotPasswordToken({ user_id, verify }: { user_id: string, verify: UserVerifyStatus }) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.ForgotPasswordToken,
        verify
      },
      privateKey: process.env.JWT_SECRET_FORGOT_TOKEN as string,
      options: {
        expiresIn: process.env.EMAIL_FORGOT_TOKEN_EXPIRE_IN
      }
    })
  }

  async forgotPassword({ user_id, verify }: { user_id: string, verify: UserVerifyStatus }) {
    const forgot_password_token = await this.signForgotPasswordToken({ user_id, verify })
    databaseService.users.updateOne({
      _id: new ObjectId(user_id)
    }, {
      $set: {
        forgot_password_token,
      },
      $currentDate: {
        updated_at: true
      }
    })
    //check email forgot
    return {
      message: USERS_MESSAGES.CHECK_EMAIL_FORGOT,
      forgot_password_token
    }
  }

  async resetPassword(user_id: string, password: string) {
    databaseService.users.updateOne({
      _id: new ObjectId(user_id)
    }, {
      $set: {
        password: hashPassword(password),
        forgot_password_token: ''
      },
    })
    return {
      message: USERS_MESSAGES.RESET_PASSWORD
    }
  }

  async getMe(user_id: string) {
    const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) }, {
      projection: {
        password: 0,
        email_verify_token: 0,
        forgot_password_token: 0
      }
    })
    return user
  }

  async updateMe(user_id: string, body: UpdateMeReqBody) {
    const user = await databaseService.users.findOneAndUpdate({
      _id: new ObjectId(user_id)
    },
      {
        $set: {
          ...body,
          date_of_birth: new Date(body.date_of_birth)
        },
        $currentDate: {
          updated_at: true
        }
      },
      {
        returnDocument: 'after',
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0
        }
      })
    return user
  }

  async follower(user_id: string, followed_user_id: string) {
    const follower = await databaseService.followers.findOne({
      user_id: new ObjectId(user_id),
      followed_user_id: new ObjectId(followed_user_id)
    })

    if (follower === null) {
      await databaseService.followers.insertOne(new Follower({
        user_id: new ObjectId(user_id),
        followed_user_id: new ObjectId(followed_user_id)
      }))

      return {
        message: USERS_MESSAGES.FOLLOW_SUCCESS
      }
    }

    return {
      message: USERS_MESSAGES.FOLLOW_ALREADY_EXISTS
    }
  }

  async unfollower(user_id: string, followed_user_id: string) {
    const follower = await databaseService.followers.findOne({
      user_id: new ObjectId(user_id),
      followed_user_id: new ObjectId(followed_user_id)
    })
    if (follower === null) {
      return {
        message: USERS_MESSAGES.ALREADY_UNFOLLOW_SUCCESS
      }
    }
    await databaseService.followers.deleteOne({
      user_id: new ObjectId(user_id),
      followed_user_id: new ObjectId(followed_user_id)
    })
    return {
      message: USERS_MESSAGES.UNFOLLOW_SUCCESS
    }
  }
}

const userService = new UserService();  // tạo ra 1 instance của UserService        
export default userService