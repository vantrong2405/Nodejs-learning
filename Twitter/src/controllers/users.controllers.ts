import { NextFunction, Request , Response } from "express";
import { RegisterReqBody } from "~/models/requests/User.requests";
import userService from "~/services/users.services";
import {ParamsDictionary} from 'express-serve-static-core'
export const loginController = (req : Request , res : Response) =>{
  const {email , password} = req.body
  if(email === 'doanvvantrong@gmail.com' && password === '123456'){
    res.json({
      message : 'Login successful'
     })
  }else{
    res.status(400).json({
      message : 'Loggin failed'
    });
  }
}

export const registerController = async (req : Request<ParamsDictionary, any, RegisterReqBody> , res : Response , next : NextFunction) =>{
  // nếu có async thì Lỗi này sẽ được Promise quản lý và chuyển vào .catch(next)
  // nếu bỏ async đi thì Lỗi này không được bắt bởi Promise, dẫn đến việc crash ứng dụng
  // throw new Error('Loi roi') 
   const result = await userService.register(req.body)
    res.json({
      message : 'Register successful',
      result
    });
}


  