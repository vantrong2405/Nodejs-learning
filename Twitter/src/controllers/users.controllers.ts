import { Request , Response } from "express";
import User from "~/models/schemas/User.schema";
import databaseService from "~/services/database.services";
import userService from "~/services/users.services";
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

export const registerController = async (req : Request , res : Response) =>{
  const {email , password} = req.body
  try {
   const result = await userService.register({email, password})
    res.json({
      message : 'Register successful',
      result
    });
    return 
  } catch (error) {
     res.status(400).json({
      message : 'Register failed',
      error
    })
    return
  }
}


  