var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var userController = require('../../api/user/user.controller');
var config = require('../../config/environment');

exports.setup = function (User, config) {
  passport.use(new GoogleStrategy({
      clientID: config.google.clientID,
      clientSecret: config.google.clientSecret,
      callbackURL: config.google.callbackURL,
      passReqToCallback: true
    },
    function(request, accessToken, refreshToken, profile, done) {
      var betaKey = request.query.state;
      if (!profile.emails) {
        return done('An email is required.', null);
      }
      var emailVals = [];
      for (var i = 0; i < profile.emails.length; i++) {
        emailVals.push(profile.emails[i].value);
      }
      User.findOne({
        '$or': [
          {'email': {'$in': emailVals}},
          {'google.id': profile.id}
        ]
      }, function(err, user) {
        if (err) {
          return done(err);
        }
        if (!user) {
          if (!config.isBeta || betaKey) {
            var userData = {
              name: profile.displayName,
              email: profile.emails[0].value,
              role: 'user',
              username: profile.username,
              provider: 'google',
              google: profile._json,
              referral: {
                referrer: betaKey,
                usersReferred: []
              }
            };
            userController.createUser(userData, function(err, user) {
              if (err) { return done(err, user); }
              return done(err, user);
            });
          }
          else {
            return done("Signup is by invitation only.", null);
          }
        }
        else {
          return done(err, user);
        }
      })
    }
  ));
};
