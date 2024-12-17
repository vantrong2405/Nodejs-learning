import { TweetAudience, TweetType } from "~/constants/enum"
import { Media } from "~/models/Other"
import { ParamsDictionary, Query } from "express-serve-static-core"

export interface TweetRequestBody {
  type: TweetType
  audience: TweetAudience
  content: string
  parent_id: null | string
  hashtags: string[]
  mentions: string[]
  medias: Media[]
}

export interface ITweetChildrenRequest {
  tweet_id: string
  tweet_type: TweetType
  limit: number
  page: number
  user_id: string
}

export interface TweetParam extends ParamsDictionary {
  user_id: string
}

export interface TweetQuery extends Query {
  tweet_type: string
  limit: string
  page: string
}