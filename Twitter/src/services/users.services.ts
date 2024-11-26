import User from "~/models/schemas/User.schema";
import databaseService from "./database.services";
import { RegisterReqBody } from "~/models/requests/User.requests";
import { hashPassword } from "~/utils/crypto";
import { signToken } from "~/utils/jwt";
import { TokenType } from "~/constants/enum";

class UserService {
  private signAccessToken(user_id : string){
    return signToken({
      payload : {
        user_id , 
        token_type: TokenType.AccessToken
      },
      options:{
        expiresIn : process.env.ACCESS_TOKEN_EXPIRES_IN     
      }
    })
  }
  private signRefreshToken(user_id : string){
    return signToken({
      payload : {
        user_id ,     
        token_type: TokenType.RefreshToken
      },
      options:{
        expiresIn : process.env.REFRESH_TOKEN_EXPIRES_IN
      }
    })
  }
 async register(payload : RegisterReqBody){
    const result = await databaseService.users.insertOne(
      new User({
        ...payload,
        date_of_birth: new Date(payload.date_of_birth), //convert ISO -> date
        password : hashPassword(payload.password)
      })
    )
    // console.log('result : ',result); // trả về object gồm id và acknowledged  
    const user_id = result.insertedId.toString() // id user   
    const [access_token , refresh_token] = await Promise.all([ // ko phụ thuộc vào name lấy
      this.signAccessToken(user_id),
      this.signRefreshToken(user_id)
    ])

    console.log('access_token : ',access_token);
    console.log('refresh_token : ',refresh_token);
    return {
      access_token,// trả về cả trường vẫn value là access_token và refresh_token 
      refresh_token,
    }
  } 

  async checkEmailExist(email : string){  
    const user = await databaseService.users.findOne({email})
    return Boolean(user)            
  }
}

const userService = new UserService();  // tạo ra 1 instance của UserService        
export default userService