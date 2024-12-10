import { checkSchema } from 'express-validator'
import { isEmpty } from 'lodash'
import { ObjectId } from 'mongodb'
import { MediaType, TweetAudience, TweetType } from '~/constants/enum'
import HTTP_STATUS from '~/constants/httpStatus'
import { TWEET_MESSAGES } from '~/constants/message'
import { ErrorWithStatus } from '~/models/Errors'
import databaseService from '~/services/database.services'
import { numberEnumToArray } from '~/utils/other'
import { validate } from '~/utils/validation'
const tweetType = numberEnumToArray(TweetType)
const tweetAudience = numberEnumToArray(TweetAudience)
const mediaType = numberEnumToArray(MediaType)

export const createTweetValidator = validate(
  checkSchema({
    type: {
      isIn: {
        options: [tweetType],
        errorMessage: TWEET_MESSAGES.INVALID_TYPE
      }
    },
    audience: {
      isIn: {
        options: [tweetAudience],
        errorMessage: TWEET_MESSAGES.INVALID_AUDIENCE
      }
    },
    parent_id: {
      custom: {
        options: (value, { req }) => {
          const type = req.body.type as TweetType
          // Nếu type là retweet, comment, quotetweet thì parent_id phải là tweet_id của tweet cha
          if ([TweetType.ReTweet, TweetType.Comment, TweetType.QuoteTweet].includes(type) && !ObjectId.isValid(value)) {
            throw new Error(TWEET_MESSAGES.PARENT_ID_MUST_BE_A_VALID_TWEET_ID)
          }
          if (type === TweetType.Tweet && value !== null) {
            throw new Error(TWEET_MESSAGES.PARENT_ID_MUST_BE_NULL)
          }
          return true
        }
      }
    },
    content: {
      isString: {
        errorMessage: TWEET_MESSAGES.CONTENT_MUST_BE_A_STRING
      },
      custom: {
        options: (value, { req }) => {
          const type = req.body.type as TweetType
          const hashtags = req.body.hashtags as string[]
          const mention = req.body.mentions as string[]
          // Nếu type là comment, quotetwet, tweet và không có mention và hashtags thì content phải là string không được rỗng
          if (
            [TweetType.Tweet, TweetType.Comment, TweetType.QuoteTweet].includes(type) &&
            isEmpty(hashtags) &&
            isEmpty(mention) &&
            value === ''
          ) {
            throw new Error(TWEET_MESSAGES.CONTENT_MUST_BE_A_NON_EMPTY_STRING)
          }
          if (type === TweetType.ReTweet && value !== '') {
            throw new Error(TWEET_MESSAGES.CONTENT_MUST_BE_A_EMPTY_STRING)
          }
          return true
        }
      }
    },
    hashtags: {
      isArray: {
        errorMessage: TWEET_MESSAGES.HASHTAGS_MUST_BE_AN_ARRAY
      },
      custom: {
        options: (value, { req }) => {
          // Yêu cầu mỗi phần tử trong array là string
          if (!value.every((item: any) => typeof item === 'string')) {
            throw new Error(TWEET_MESSAGES.HASHTAGS_MUST_BE_STRING_ARRAY)
          }
          return true
        }
      }
    },
    mentions: {
      isArray: {
        errorMessage: TWEET_MESSAGES.HASHTAGS_MUST_BE_AN_ARRAY
      },
      custom: {
        options: (value, { req }) => {
          // Yêu cầu mỗi phần tử trong array là user_id
          if (!value.every((item: any) => ObjectId.isValid(item))) {
            throw new Error(TWEET_MESSAGES.MENTIONS_MUST_BE_USER_ID_ARRAY)
          }
          return true
        }
      }
    },
    medias: {
      isArray: {
        errorMessage: TWEET_MESSAGES.MEDIA_MUST_BE_AN_ARRAY
      },
      custom: {
        options: (value, { req }) => {
          // Yêu cầu mỗi phần tử trong array là Media
          if (
            !value.every((item: any) => {
              return typeof item.url !== 'string' || !mediaType.includes(item.type)
            })
          ) {
            throw new Error(TWEET_MESSAGES.MEDIA_MUST_BE_AN_ARRAY_OF_MEDIA_OBJECT)
          }
          return true
        }
      }
    }
  })
)

export const tweetIDValidator = validate(
  checkSchema(
    {
      tweet_id: {
        isMongoId: {
          errorMessage: TWEET_MESSAGES.INVALID_TWEET_ID
        }, custom: {
          options: async (value, { req }) => {
            const exists = await databaseService.tweet.findOne({
              _id: new ObjectId(value)
            })
            if (!exists) {
              throw new ErrorWithStatus({ status: HTTP_STATUS.NOTFOUND, message: TWEET_MESSAGES.TWEET_NOT_FOUND })
            }
          }
        }
      }
    },
    ['params', 'body']
  )
)