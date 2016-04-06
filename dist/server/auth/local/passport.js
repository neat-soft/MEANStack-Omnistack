var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

exports.setup = function (User, config) {
  passport.use(new LocalStrategy({
      usernameField: 'email',
      passwordField: 'password' // this is the virtual field on the model
    },
    function(email, password, done) {
      User.findOne({
        email: email.toLowerCase()
      }, function(err, user) {
        if (err) return done(err);

        if (!user) {
          return done(null, false, { message: 'This email is not registered.' });
        }
        if (!user.authenticate(password)) {
          if (user.edmodo) {
            return done(null, false, {message: 'You already have an edmodo-based account. Try logging in using that.'});
          }
          if (user.facebook) {
            return done(null, false, {message: 'You already have a facebook-based account. Try logging in using that.'});
          }
          if (user.google) {
            return done(null, false, {message: 'You already have a google-based account. Try logging in using that.'});
          }
          return done(null, false, { message: 'This password is not correct.' });
        }
        //Add this login to the user's entry
        User.findByIdAndUpdate(user.id, {lastLogin: Date(Date.now())}, function(err, user) {
          if (err) {
            console.log("Error: " + err);
          }
        })
        return done(null, user);
      });
    }
  ));
};
