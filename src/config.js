require('dotenv').config();

module.exports = {
  port: process.env.PORT,
  webhookToken: process.env.WEBHOOK_TOKEN,
  facebookClientID: process.env.FACEBOOK_CLIENT_ID,
  facebookClientSecret: process.env.FACEBOOK_CLIENT_SECRET,
};