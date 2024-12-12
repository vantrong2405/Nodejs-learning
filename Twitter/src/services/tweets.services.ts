import { TweetRequestBody } from '~/models/requests/Tweet.request'
import databaseService from './database.services'
import { ObjectId, WithId } from 'mongodb'
import Hashtag from '~/models/schemas/Hashtag.schema'
import Tweet from '~/models/schemas/Tweets.schema'
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
}
const tweetServices = new TweetService()
export default tweetServices