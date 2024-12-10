import express from 'express'
import { createTweetController } from '~/controllers/tweets.controllers'
import { createTweetValidator } from '~/middlewares/tweets.middleware'
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'
const TweetRouter = express.Router()

TweetRouter.post('/', accessTokenValidator, verifiedUserValidator, createTweetValidator, wrapRequestHandler(createTweetController))

export default TweetRouter