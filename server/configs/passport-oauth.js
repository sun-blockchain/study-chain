const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('../models/User');
const USER_ROLES = require('./constant').USER_ROLES;
const OAUTH_TYPES = require('./constant').OAUTH_TYPES;
const network = require('../fabric/network');

require('dotenv').config();

passport.use(
  new GoogleStrategy(
    {
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    },
    async (accessToken, refreshToken, profile, done) => {
      let user;
      user = await User.findOne({
        username: profile.id,
        oauthType: OAUTH_TYPES.GOOGLE
      });
      if (user) {
        return done(null, user);
      }
      user = {
        username: profile.id,
        oauthType: OAUTH_TYPES.GOOGLE,
        fullname: profile.name.familyName + ' ' + profile.name.givenName,
        role: USER_ROLES.STUDENT
      };
      const response = await network.registerStudentOnBlockchain(user);

      if (!response.success) {
        return done(null, { success: false, msg: 'Register failed' });
      }
      return done(null, user);
    }
  )
);

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: process.env.FACEBOOK_CALLBACK,
      enableProof: true,
      profileFields: ['id', 'displayName', 'photos', 'email']
    },
    async (accessToken, refreshToken, profile, done) => {
      let user;
      user = await User.findOne({
        username: profile.id,
        oauthType: OAUTH_TYPES.FACEBOOK
      });
      if (user) {
        return done(null, user);
      }
      user = {
        username: profile.id,
        oauthType: OAUTH_TYPES.FACEBOOK,
        fullname: profile.displayName
      };
      const response = await network.registerStudentOnBlockchain(user);
      if (!response.success) {
        return done(null, { success: false, msg: 'Register failed' });
      }
      return done(null, user);
    }
  )
);
