export const USERS_MESSAGES = {
  VALIDATION_ERROR: 'Validation error',
  USER_NOT_FOUND: 'User not found',
  NAME_IS_REQUIRED: 'Name is required',
  NAME_MUST_BE_A_STRING: 'Name must be a string',
  NAME_LENGTH_MUST_BE_FROM_1_TO_100: 'Name length must be from 1 to 100',
  EMAIL_ALREADY_EXISTS: 'Email already exists',
  EMAIL_IS_REQUIRED: 'Email is required',
  PASSWORD_IS_REQUIRED: 'Password is required',
  PASSWORD_MUST_BE_A_STRING: 'Password must be a string',
  PASSWORD_LENGTH_MUST_BE_FROM_6_TO_50: 'Password length must be from 6 to 50',
  PASSWORD_MUST_BE_STRONG: 'Pass word must min 1 characters lowercase, 1 characters uppercase, 1 number, 1 special character',
  CONFIRM_PASSWORD_IS_REQUIRED: 'Confirm password is required',
  CONFIRM_PASSWORD_MUST_BE_A_STRING: 'Confirm password must be a string',
  CONFIRM_PASSWORD_LENGTH_MUST_BE_FROM_6_TO_50: 'Confirm password length must be from 6 to 50',
  CONFIRM_PASSWORD_MUST_BE_STRONG: 'Confirm password must min 1 characters lowercase, 1 characters uppercase, 1 number, 1 special character',
  CONFIRM_PASSWORD_MUST_BE_EQUAL_TO_PASSWORD: 'Confirm password does not match password',
  DATE_OF_BIRTH_IS_IO8601: 'Date of birth must be in ISO8601 format',
  LOGIN_SUCCESS: 'Login success',
  REGISTER_SUCCESS: 'Register success',
  ACCESS_TOKEN_IS_REQUIRED: 'Access token is required',
  REFRESH_TOKEN_IS_REQUIRED: 'Refresh token is required',
  REFRESH_TOKEN_MUST_A_STRING: 'Refresh token must be a string',
  REFRESH_TOKEN_INVALID: 'Refresh token invalid',
  LOGOUT_SUCCESS: 'Logout success',
  REFRESH_TOKEN_NOT_EXITS: 'Refresh token not exits',
  ACCESS_TOKEN_IS_IN_INVAILD: 'Access token is invalid',
  EMAIL_IS_INVALID: 'Email is invalid',
  EMAIL_VERIFY_SUCCESS: 'Email verify success',
  EMAIL_VERIFY_FAIL: 'Email verify fail',
  EMAIL_VERIFY_TOKEN_IS_REQUIRED: 'Email verify token is required',
  EMAIL_VERIFY_TOKEN_IS_INVALID: 'Email verify token is invalid',
  EMAIL_VERIFY_TOKEN_IS_EXPIRED: 'Email verify token is expired',
  EMAIL_VERIFY_TOKEN_IS_NOT_FOUND: 'Email verify token is not found',
  EMAIL_VERIFY_TOKEN_IS_NOT_MATCH: 'Email verify token is not match',
  EMAIL_VERIFY_TOKEN_IS_NOT_MATCH_WITH_EMAIL: 'Email verify token is not match with email',
  EMAIL_VERIFY_TOKEN_IS_NOT_MATCH_WITH_USER: 'Email verify token is not match with user',
  EMAIL_VERIFY_TOKEN_IS_NOT_MATCH_WITH_USER_EMAIL: 'Email verify token is not match with user email',
  EMAIL_VERIFY_TOKEN_IS_NOT_MATCH_WITH_USER_EMAIL_VERIFY_TOKEN: 'Email verify token is not match with user email verify token',
  EMAIL_ALREADY_VERIFY_BEFORE: 'Email already verified before',
  EMAIL_ALREADY_VERIFIED: 'Email already verified',
  RESEND_VERIFY_EMAIL_SUCCESS: 'Resend verify email success',
  CHECK_EMAIL_FORGOT: 'Check email forgot',
  FORGOT_PASSWORD_TOKEN_IS_REQUIRED: 'Verify forgot password token validator',
  FORGOT_PASSWORD_TOKEN_IS_INVALID: 'Forgot password token is invalid',
  VERIFY_FORGOT_PASSWORD_TOKEN_SUCCESS: 'Verify forgot password token success',
  RESET_PASSWORD: 'Reset password success',
  GET_ME_SUCCESS: 'Get me success',
  USER_NOT_VERIFIED: 'User not verified',
  BIO_MUST_BE_A_STRING: 'Bio must be a string',
  BIO_LENGTH: 'Bio length must be from 1 to 200',
  LOCATION_MUST_BE_A_STRING: 'Location must be a string',
  LOCATION_LENGTH: 'Location length must be from 1 to 200',
  WEBSITE_MUST_BE_A_STRING: 'Website must be a string',
  WEBSITE_LENGTH: 'Website length must be from 1 to 200',
  USERNAME_MUST_BE_A_STRING: 'Username must be a string',
  USERNAME_LENGTH: 'Username length must be from 1 to 50',
  IMG_MUST_BE_A_STRING: 'Image must be a string',
  IMG_LENGTH: 'Image length must be from 1 to 400',
  UPDATE_ME_SUCCESS: 'Update me success',
  FOLLOW_SUCCESS: 'Follow success',
  INVALID_FOLLOW_USER_ID: 'Invalid follower userid',
  FOLLOW_ALREADY_EXISTS: 'Follow already exists',
} as const