/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

/**
 * Passport.js reference implementation.
 * The database schema used in this sample is available at
 * https://github.com/membership/membership.db/tree/master/postgres
 */

import passport from 'passport';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { User, UserLogin, UserClaim, UserProfile } from '../data/models';
import { auth as config, dataMap, calendarEncryptSecret } from '../config';
var crm = require('../data/models/Crm.js');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var CryptoJS = require("crypto-js");



passport.serializeUser(function (user, done) {
  console.log('[Passport] Serialize user', user.id);
  if(typeof user.id !== 'undefined')
    done(null, user.id);
  else
    done(user.errorMessage);
});
passport.deserializeUser(function (id, done) {
  console.log('[Passport] Deserialize user', id);
  crm.internalGetUserById(id).then((user)=>{
    done(null, user);
  });
});

exports.isAuthenticated = function (req, res, next) {
  if(req.isAuthenticated()) {
    return next();
  }
  res.redirect('/app.html');
};
/**
 * Authorization Required middleware.
 */
exports.isAuthorized = function (req, res, next) {
  var provider = req.path.split('/').slice(-1)[0];
  if(_.find(req.user.tokens, {
      kind: provider
    })) {
    next();
  } else {
    res.redirect('/auth/' + provider);
  }
};

/**
 * Sign in with Facebook.
 */
passport.use(new FacebookStrategy({
  clientID: config.facebook.id,
  clientSecret: config.facebook.secret,
  callbackURL: '/login/facebook/return',
  profileFields: ['name', 'email', 'link', 'locale', 'timezone'],
  passReqToCallback: true,
}, (req, accessToken, refreshToken, profile, done) => {
  /* eslint-disable no-underscore-dangle */
  const loginName = 'facebook';
  const claimType = 'urn:facebook:access_token';
  const fooBar = async () => {
    if (req.user) {
      const userLogin = await UserLogin.findOne({
        attributes: ['name', 'key'],
        where: { name: loginName, key: profile.id },
      });
      if (userLogin) {
        // There is already a Facebook account that belongs to you.
        // Sign in with that account or delete it, then link it with your current account.
        done();
      } else {
        const user = await User.create({
          id: req.user.id,
          email: profile._json.email,
          logins: [
            { name: loginName, key: profile.id },
          ],
          claims: [
            { type: claimType, value: profile.id },
          ],
          profile: {
            displayName: profile.displayName,
            gender: profile._json.gender,
            picture: `https://graph.facebook.com/${profile.id}/picture?type=large`,
          },
        }, {
          include: [
            { model: UserLogin, as: 'logins' },
            { model: UserClaim, as: 'claims' },
            { model: UserProfile, as: 'profile' },
          ],
        });
        done(null, {
          id: user.id,
          email: user.email,
        });
      }
    } else {
      const users = await User.findAll({
        attributes: ['id', 'email'],
        where: { '$logins.name$': loginName, '$logins.key$': profile.id },
        include: [
          {
            attributes: ['name', 'key'],
            model: UserLogin,
            as: 'logins',
            required: true,
          },
        ],
      });
      if (users.length) {
        done(null, users[0]);
      } else {
        let user = await User.findOne({ where: { email: profile._json.email } });
        if (user) {
          // There is already an account using this email address. Sign in to
          // that account and link it with Facebook manually from Account Settings.
          done(null);
        } else {
          user = await User.create({
            email: profile._json.email,
            emailConfirmed: true,
            logins: [
              { name: loginName, key: profile.id },
            ],
            claims: [
              { type: claimType, value: accessToken },
            ],
            profile: {
              displayName: profile.displayName,
              gender: profile._json.gender,
              picture: `https://graph.facebook.com/${profile.id}/picture?type=large`,
            },
          }, {
            include: [
              { model: UserLogin, as: 'logins' },
              { model: UserClaim, as: 'claims' },
              { model: UserProfile, as: 'profile' },
            ],
          });
          done(null, {
            id: user.id,
            email: user.email,
          });
        }
      }
    }
  };

  fooBar().catch(done);
}));

passport.use(new GoogleStrategy({
            clientID: config.google.id,
            clientSecret: config.google.secret,
            callbackURL: '/auth/google/callback',
            passReqToCallback: true}, function (req, accessToken, refreshToken, profile, done) {
    console.log('[Passport.js/google] profile', JSON.stringify(profile));
    console.log('[Passport.js/google] req user' + req.user);
    console.log('[Passport.js/google] accessToken=' + accessToken);
    console.log('[Passport.js/google] refreshToken=' + refreshToken);
    profile.googleToken = accessToken;
    profile.googleRefreshToken = refreshToken;
    var personObj = {id: req.user.id};
    personObj[dataMap.PERSON_FIELD_MAP.calendarAccessToken] = CryptoJS.AES.encrypt(accessToken, calendarEncryptSecret).toString();
    personObj[dataMap.PERSON_FIELD_MAP.calendarRefreshToken] = CryptoJS.AES.encrypt(refreshToken, calendarEncryptSecret).toString();
    crm.internalUpdatePerson(personObj).then(response=>{
         console.log("save tokens to users", response);
         return done(null, profile);
    }).catch((err)=>{
        console.log("failed to save tokens to user", err);
    });


}));

export default passport;
