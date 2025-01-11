import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { BOOKMARK_MESSAGES } from '~/constants/message'
import { BookmarkTweetRequestBody } from '~/models/requests/Bookmark.request'
import { TokenPayload } from '~/models/requests/User.requests'
import bookmarkService from '~/services/bookmarks.services'
export const bookmarkTweetController = async (
  req: Request<ParamsDictionary, any, BookmarkTweetRequestBody>,
  res: Response
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await bookmarkService.bookmarkTweet(user_id, req.body.tweet_id)
  return res.json({
    message: BOOKMARK_MESSAGES.BOOKMARK_TWEET_SUCCESSFULLY,
    result
  })
}
export const unBookmarkTweetController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await bookmarkService.unBookmarkTweet(user_id, req.params.tweet_id)
  return res.json({
    message: BOOKMARK_MESSAGES.UN_BOOKMARK_TWEET_SUCCESSFULLY,
    result
  })
}