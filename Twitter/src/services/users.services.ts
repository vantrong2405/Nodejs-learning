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
import axios from 'axios';
import { ErrorWithStatus } from "~/models/Errors";
import HTTP_STATUS from "~/constants/httpStatus";

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
    await databaseService.users.insertOne(
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

  private async getOauthGoogleToken(code: string) {
    const body = {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      grant_type: 'authorization_code'
    }

    const { data } = await axios.post('https://oauth2.googleapis.com/token', body, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
    return data as {
      access_token: string,
      id_token: string,
    }
  }

  private async getGoogleUserInfo(access_token: string, id_token: string) {
    const { data } = await axios.get(
      'https://www.googleapis.com/oauth2/v3/tokeninfo',
      {
        params: {
          access_token,
          alt: 'json'
        },
        headers: {
          Authorization: `Bearer ${id_token}`
        }
      }
    )
    return data as {
      user_id: string
      email: string
      email_verified: string
      access_type: string
    }
  }

  async oauth(code: string) {
    const { id_token, access_token } = await this.getOauthGoogleToken(code)
    const userInfo = await this.getGoogleUserInfo(access_token, id_token)
    if (!userInfo.email_verified) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.GMAIL_NOT_VERIFIED,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    const user = await databaseService.users.findOne({
      email: userInfo.email
    })

    if (user) {
      const [access_token, refresh_token] = await this.signAccessAndRefreshToken(
        { user_id: user._id.toString(), verify: UserVerifyStatus.Verified }
      )
      await databaseService.refreshTokens.insertOne(new RefreshToken({ user_id: user._id, token: refresh_token }))
      return {
        access_token,
        refresh_token,
        newUser: 0,// chưa có user thì user = 0 
        verify: user.verify
      }
    } else {
      const passwordRandom = Math.random().toString(36).substring(2, 15)
      const data = await this.register({
        email: userInfo.email,
        password: passwordRandom,
        confirm_password: passwordRandom,
        date_of_birth: new Date().toISOString(),
        name: userInfo.email
      })
      return { ...data, newUser: 1, verify: UserVerifyStatus.Unverified }
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
    await databaseService.refreshTokens.insertOne(new RefreshToken({ user_id: new ObjectId(user_id), token: refresh_token }))
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

  async changePassword(user_id: string, new_password: string) {
    await databaseService.users.updateOne({
      _id: new ObjectId(user_id)
    }, {
      $set: {
        new_password: hashPassword(new_password)
      }
    })
    return {
      message: USERS_MESSAGES.CHANGE_PASSWORD_SUCCESS
    }
  }
  async refreshToken({ user_id, verify, refresh_token }: { user_id: string, verify: UserVerifyStatus, refresh_token: string }) {
    const [new_access_token, new_refresh_token] = await Promise.all(
      [
        this.signAccessToken({ user_id, verify }),
        this.signRefreshToken({ user_id, verify }),
        databaseService.refreshTokens.deleteOne({ user_id: new ObjectId(user_id) })
      ]
    )
    return {
      access_token: new_access_token,
      refresh_token: new_refresh_token
    }
  }
}

const userService = new UserService();  // tạo ra 1 instance của UserService        
export default userService