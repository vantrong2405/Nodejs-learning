export enum UserVerifyStatus {
  Unverified,
  Verified,
  Banned
}

export enum TokenType {
  AccessToken,
  RefreshToken,
  ForgotPasswordToken,
  EmailVerifyToken
}

export enum MediaType {
  Image,
  Video,
  HLS
}

export enum EncodingStatus {
  Pending,
  Processing,
  Success,
  Failed
}

export enum TweetType {
  Tweet,
  ReTweet,
  Comment,
  QuoteTweet
}
export enum TweetAudience {
  Everyone,
  TweetCircle
}