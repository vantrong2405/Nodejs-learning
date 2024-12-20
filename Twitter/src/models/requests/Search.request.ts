import { MediaQuery } from '~/constants/enum'
import { Pagination } from './Tweet.request'
import { Query } from 'express-serve-static-core'
export interface SearchQuery extends Pagination, Query {
  content: string
  media_type: MediaQuery
  people_follow: string
}