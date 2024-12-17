import express from 'express'
import { createTweetController, getTweetChildrenController, getTweetController } from '~/controllers/tweets.controllers'
import { audienceValidator, createTweetValidator, getTweetChildrenValidator, tweetIDValidator } from '~/middlewares/tweets.middleware'
import { accessTokenValidator, isUserLoginValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'
const TweetRouter = express.Router()

TweetRouter.post('/', accessTokenValidator, verifiedUserValidator, createTweetValidator, wrapRequestHandler(createTweetController))
TweetRouter.get('/:tweet_id', tweetIDValidator, isUserLoginValidator(accessTokenValidator), isUserLoginValidator(verifiedUserValidator), audienceValidator, wrapRequestHandler(getTweetController))
TweetRouter.get('/:tweet_id/children', tweetIDValidator, getTweetChildrenValidator, isUserLoginValidator(accessTokenValidator), isUserLoginValidator(verifiedUserValidator), audienceValidator, wrapRequestHandler(getTweetChildrenController))
export default TweetRouter