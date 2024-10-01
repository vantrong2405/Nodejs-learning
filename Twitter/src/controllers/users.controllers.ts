import { Request , Response } from "express";
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

export const registerController = async (req : Request<ParamsDictionary, any, RegisterReqBody > , res : Response) =>{
  try {
   const result = await userService.register(req.body)
    res.json({
      message : 'Register successful',
      result
    });
  } catch (error) {
     res.status(400).json({
      message : 'Register failed',
      error
    })
  }
}


  