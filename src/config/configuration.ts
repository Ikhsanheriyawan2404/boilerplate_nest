export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  database: {
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
  },
  jwt: {
    access_token_exp: process.env.JWT_ACCESS_EXPIRATION_MINUTES,
    refresh_token_exp: process.env.JWT_REFRESH_EXPIRATION_DAYS,
    access_token_secret: process.env.JWT_ACCESS_SECRET,
    refresh_token_secret: process.env.JWT_REFRESH_SECRET,
  },
});
  