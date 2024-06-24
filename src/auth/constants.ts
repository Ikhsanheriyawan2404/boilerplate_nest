export const jwtConstants = {
  access_token_exp: process.env.JWT_ACCESS_EXPIRATION_MINUTES,
  refresh_token_exp: process.env.JWT_REFRESH_EXPIRATION_DAYS,
  access_token_secret: process.env.JWT_ACCESS_SECRET,
  refresh_token_secret: process.env.JWT_REFRESH_SECRET,
};