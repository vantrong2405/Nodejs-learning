import { NextFunction, Response, Request } from "express"
import tweetServices from "~/services/tweet.services"

export const createTweetController = async (req: Request, res: Response, next: NextFunction) => {

  const { user_id } = req.decoded_authorization
  const result = await tweetServices.createTweet(req.body, user_id)
  console.log("🚀 ~ createTweetController ~ result:", result)
  
  res.json({
    message: 'create successfully',
    result
  })
}