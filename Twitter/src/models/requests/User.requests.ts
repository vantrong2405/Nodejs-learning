import { JwtPayload } from "jsonwebtoken"
import { TokenType } from "~/constants/enum"

export interface RegisterReqBody {
  email: string
  name: string
  password: string
  confirm_password: string
  date_of_birth: string
}

export interface UpdateMeReqBody {
  name: string
  date_of_birth: string
  bio: string
  location: string
  website: string
  username: string
  avatar: string
  cover_photo: string
}

export type UpdateMeReqBodyPartial = Partial<UpdateMeReqBody>

export interface TokenPayload extends JwtPayload {
  user_id: string
  token_type: TokenType
}