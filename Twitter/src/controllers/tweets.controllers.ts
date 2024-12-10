import { NextFunction, Response, Request } from "express"
import { TWEET_MESSAGES } from "~/constants/message"
import tweetServices from "~/services/tweets.services"

export const createTweetController = async (req: Request, res: Response, next: NextFunction) => {

  const { user_id } = req.decoded_authorization
  const result = await tweetServices.createTweet(req.body, user_id)

  res.json({
    message: TWEET_MESSAGES.CREATE_TWEET_SUCCESS,
    result
  })
}