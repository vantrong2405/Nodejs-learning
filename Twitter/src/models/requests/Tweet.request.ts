import { TweetAudience, TweetType } from "~/constants/enum"
import { Media } from "~/models/Other"

export interface TweetRequestBody {
  type: TweetType
  audience: TweetAudience
  content: string
  parent_id: null | string
  hashtags: string[]
  mentions: string[]
  medias: Media[]
}