import { Request, Response, NextFunction } from 'express';
import { checkSchema } from 'express-validator';
import userService from '~/services/users.services';
import { validate } from '~/utils/validation';

export const loginValidator = (req: Request, res: Response, next: NextFunction): void => {
  const { email, password } = req.body;
  if (!email || !password) {
     res.status(400).json({
      message: 'Invalid email or password'
    });
    return
  }
  next();
};

// receive name : string , email : string , password : string , confirm_password : string, date_of_birth: ISO8601 
export const registerValidator = validate(checkSchema({
  name : {
    notEmpty : true , 
    isString : true , 
   isLength :{
    options : {
      min : 1 , 
      max : 50 
    },
   },
   trim : true
  },
  email : {
    notEmpty : true,
    isEmail : true, 
    trim : true ,
    custom : {
      options : async (value)=>{
        const isExistEmail = await userService.checkEmailExist(value)
        if(isExistEmail){
          throw new Error('Email already exists')
        }
        return true
      }
    }
  },
  password : { 
    notEmpty : true ,
    isString : true,
    isLength : {
      options:{
        min : 6 , 
        max : 50 
      },
      errorMessage : 'Password should be at least 6 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    },
    isStrongPassword :{
      options:{
        minLength : 6 ,
        minLowercase: 1,
         minUppercase: 1, 
         minNumbers: 1,
          minSymbols: 1 // ký tự đặc biệt
      },
      errorMessage : 'Password should be at least 6 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    }
  },
  confirm_password : {
    notEmpty : true ,
    isString : true,
    isLength : {
      options:{
        min : 6 , 
        max : 50 
      }
    },
    isStrongPassword :{
      options:{
        minLength : 6 ,
        minLowercase: 1,
         minUppercase: 1, 
         minNumbers: 1,
          minSymbols: 1
      }
    },
    custom : {
      options : (value , {req})=>{
        if(value !== req.body.password){
          throw new Error('Confirm Passwords do not match password')
        }
        return true 
      }
    } 
  },
  date_of_birth :{
    isISO8601 : {
      options:{
        strict : true,
        strictSeparator : true
      }
    }
  }
}))