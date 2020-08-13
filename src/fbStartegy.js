const passport = require('passport');
const { Strategy: FacebookStrategy } = require('passport-facebook');
const config = require('./config');

/**
 * Strategia con passport-facebook
 * https://github.com/jaredhanson/passport-facebook
 */
passport.use(new FacebookStrategy({
    clientID: config.facebookClientID,
    clientSecret: config.facebookClientSecret,
    callbackURL: '/auth/facebook/callback',
  },
  function(accessToken, refreshToken, profile, cb) {
    return cb(null, { profile, accessToken });
  }
));