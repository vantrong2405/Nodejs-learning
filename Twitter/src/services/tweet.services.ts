import { TweetRequestBody } from '~/models/requests/Tweet.request'
import databaseService from './database.services'
import { ObjectId, WithId } from 'mongodb'
import Tweet from '~/models/schemas/Tweets.schema'
class TweetService {
  createTweet = async (body: TweetRequestBody, user_id: string) => {
    const result = await databaseService.tweet.insertOne(
      new Tweet({
        audience: body.audience,
        content: body.content,
        parent_id: null,
        type: body.type,
        user_id: new ObjectId(user_id),
        mentions: [],
        hashtags: [],
        medias: [],
      })
    )
    const user = await databaseService.tweet.findOne({
      _id: result.insertedId
    })
    return user
  }
}
const tweetServices = new TweetService()
export default tweetServices