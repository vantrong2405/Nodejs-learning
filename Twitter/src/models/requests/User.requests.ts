import { JwtPayload } from "jsonwebtoken"
import { TokenType } from "~/constants/enum"

export interface RegisterReqBody {
  email: string
  name: string
  password: string
  confirm_password: string
  date_of_birth: string
}

export interface TokenPayload extends JwtPayload {
  user_id: string
  token_type: TokenType
}