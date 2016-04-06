'use strict';

var express = require('express');
var passport = require('passport');
var auth = require('../auth.service');

var router = express.Router();

router
  .get('/', passport.authenticate('google', {
    failureRedirect: '/signup',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email'
    ],
    session: false
  }))

  .get('/key/:betaKey', function(req, res, next) {
      passport.authenticate('google', {
      failureRedirect: '/signup',
      scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email'
      ],
      session: false,
      state: req.params.betaKey
    })(req, res, next);
  })

  .get('/callback', function(req, res, next){
    passport.authenticate(
      'google', {
        failureRedirect: '/signup',
        session: false
      }, function(err, user, info) {
        if (err) {
          console.log(String(err));
          // Omninox-based error
          // Can check for specific error and redirect to a specific page
          // potential error handling function in Auth
          res.cookie('signupError', err);
          res.redirect('/signup');
        }
        else {
          req.user = user;
          auth.setTokenCookie(req, res);
        }
      })(req, res, next)
  });

module.exports = router;
