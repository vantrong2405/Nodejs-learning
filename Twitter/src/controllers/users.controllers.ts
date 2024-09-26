import { Request , Response } from "express";
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
  