import { ITweetChildrenRequest, TweetRequestBody } from '~/models/requests/Tweet.request'
import databaseService from './database.services'
import { ObjectId, WithId } from 'mongodb'
import Hashtag from '~/models/schemas/Hashtag.schema'
import Tweet from '~/models/schemas/Tweets.schema'
import { TweetType } from '~/constants/enum'
import { ppid } from 'process'
class TweetService {
  async checkAndCreateHashtags(hashtags: string[]) { // câu lệnh query nếu tìm ra thì trả về , ko tìm ra thì create và trả về
    const hashtagDocuments = await Promise.all(
      hashtags.map((hashtag) => {
        return databaseService.hashtag.findOneAndUpdate(
          { name: hashtag },
          { $setOnInsert: new Hashtag({ name: hashtag }) },
          { upsert: true, returnDocument: 'after' } // returnDocument: 'after' : trả về sau khi update data
        )
      })
    )
    return hashtagDocuments.map((hashtag) => (hashtag as WithId<Hashtag>)._id)
  }

  async createTweet(body: TweetRequestBody, user_id: string) {
    const hashtags = await this.checkAndCreateHashtags(body.hashtags)
    const result = await databaseService.tweet.insertOne(
      new Tweet({
        audience: body.audience,
        content: body.content,
        mentions: body.mentions,
        hashtags,
        medias: body.medias,
        parent_id: body.parent_id,
        type: body.type,
        user_id: new ObjectId(user_id)
      })
    )
    const user = await databaseService.tweet.findOne({
      _id: result.insertedId
    })
    return user
  }

  async increaseView(tweet_id: string, user_id?: string) {
    const inc = user_id ? { user_views: 1 } : { guest_views: 1 }
    const result = await databaseService.tweet.findOneAndUpdate(
      { _id: new ObjectId(tweet_id) },
      {
        $inc: inc,
        $currentDate: { updated_at: true }
      },
      {
        returnDocument: 'after',
        projection: { guest_views: 1, user_views: 1, updated_at: 1 }
      }
    )
    return result as {
      guest_views: number,
      user_views: number,
      updated_at: Date
    }
  }

  async getTweetChildren({
    tweet_id,
    tweet_type,
    limit,
    page,
    user_id
  }: ITweetChildrenRequest) {
    const tweets = await databaseService.tweet.aggregate<Tweet>(
      [
        {
          '$match': {
            'parent_id': new ObjectId(tweet_id),
            'type': tweet_type
          }
        }, {
          '$lookup': {
            'from': 'hashtags',
            'localField': 'hashtags',
            'foreignField': '_id',
            'as': 'hashtags'
          }
        }, {
          '$lookup': {
            'from': 'users',
            'localField': 'mentions',
            'foreignField': '_id',
            'as': 'mentions'
          }
        }, {
          '$addFields': {
            'mentions': {
              '$map': {
                'input': '$mentions',
                'as': 'mention',
                'in': {
                  '_id': '$$mention._id',
                  'name': '$$mention.name',
                  'username': '$$mention.username',
                  'email': '$$mention.email'
                }
              }
            }
          }
        }, {
          '$lookup': {
            'from': 'bookmarks',
            'localField': '_id',
            'foreignField': 'tweet_id',
            'as': 'bookmarks'
          }
        }, {
          '$lookup': {
            'from': 'likes',
            'localField': '_id',
            'foreignField': 'tweet_id',
            'as': 'likes'
          }
        }, {
          '$lookup': {
            'from': 'tweets',
            'localField': '_id',
            'foreignField': 'parent_id',
            'as': 'tweet_children'
          }
        }, {
          '$addFields': {
            'bookmarks': {
              '$size': '$bookmarks'
            },
            'likes': {
              '$size': '$likes'
            },
            'retweet_count': {
              '$size': {
                '$filter': {
                  'input': '$tweet_children',
                  'as': 'item',
                  'cond': {
                    '$eq': [
                      '$$item.type', TweetType.ReTweet
                    ]
                  }
                }
              }
            },
            'commment_count': {
              '$size': {
                '$filter': {
                  'input': '$tweet_children',
                  'as': 'item',
                  'cond': {
                    '$eq': [
                      '$$item.type', TweetType.Comment
                    ]
                  }
                }
              }
            },
            'quote_count': {
              '$size': {
                '$filter': {
                  'input': '$tweet_children',
                  'as': 'item',
                  'cond': {
                    '$eq': [
                      '$$item.type', TweetType.QuoteTweet
                    ]
                  }
                }
              }
            }
          }
        }, {
          '$project': {
            'tweet_children': 0
          }
        }, {
          '$skip': 5
        }, {
          '$limit': 5
        }
      ]
    ).toArray()
    const ids = tweets.map((tweet) => tweet._id as ObjectId)
    const inc = user_id ? { user_views: 1 } : { guest_views: 1 }
    const date = new Date()
    const [, total] = await Promise.all([
      databaseService.tweet.updateMany({
        _id: {
          $in: ids
        }
      }, {
        $inc: inc,
        $set: {
          updated_at: date
        }
      }),
      databaseService.tweet.countDocuments({
        parent_id: new ObjectId(tweet_id),
        type: tweet_type
      })
    ])
    tweets.forEach((tweet) => {
      tweet.updated_at = date
      if (user_id) {
        tweet.user_views = (tweet.user_views || 0) + 1
      } else {
        tweet.guest_views = (tweet.guest_views || 0) + 1
      }
    })
    return {
      tweets, total
    }
  }
}
const tweetServices = new TweetService()
export default tweetServices