'use strict';

var mongoose = require('mongoose');
var passport = require('passport');
var config = require('../config/environment');
var jwt = require('jsonwebtoken');
var expressJwt = require('express-jwt');
var compose = require('composable-middleware');
var User = require('../api/user/user.model');
var validateJwt = expressJwt({ secret: config.secrets.session });
var unsecurelyValidateJwt = expressJwt({ secret: config.secrets.session, credentialsRequired: false });
/**
 * Attaches the user object to the request if authenticated
 * Otherwise returns 403
 */
function isAuthenticated() {
  return compose()
    // Validate jwt
    .use(function(req, res, next) {
      // allow access_token to be passed through query parameter as well
      if(req.query && req.query.hasOwnProperty('access_token')) {
        req.headers.authorization = 'Bearer ' + req.query.access_token;
      }
      validateJwt(req, res, next);
    })
    // Attach user to request
    .use(function(req, res, next) {
      User.findById(req.user._id, function (err, user) {
        if (err) return next(err);
        if (!user) return res.send(401);

        req.user = user;
        next();
      });
    });
}

/**
 * Attaches the user object to the request if authenticated
 * Otherwise continues with null req.user.
 */
function isOptionallyAuthenticated() {
  return compose()
    // Validate jwt
    .use(function(req, res, next) {
      // allow access_token to be passed through query parameter as well
      if(req.query && req.query.hasOwnProperty('access_token')) {
        req.headers.authorization = 'Bearer ' + req.query.access_token;
      } else {
        req.headers.authorization = 'Bearer false'
      }
      unsecurelyValidateJwt(req, res, next);
    })
    // Attach user to request
    .use(function(req, res, next) {
      if (req.user) {
        User.findById(req.user._id, function (err, user) {
          if (err) return next(err);
          if (!user) return res.send(401);

          req.user = user;
          next();
        });
    } else {
      next();
    }
    });
}

/**
 * Checks if the user role meets the minimum requirements of the route
 */
function hasRole(roleRequired) {
  if (!roleRequired) throw new Error('Required role needs to be set');

  return compose()
    .use(isAuthenticated())
    .use(function meetsRequirements(req, res, next) {
      if (config.userRoles.indexOf(req.user.role) >= config.userRoles.indexOf(roleRequired)) {
        next();
      }
      else {
        res.send(403);
      }
    });
}

/**
 * Checks if the user is Admin or Teacher
 */
function hasAdminOrTeacher() {
  return compose()
    .use(isAuthenticated())
    .use(function meetsRequirements(req, res, next) {
      if (req.user.academicRole === 'Teacher' || req.user.role==='admin') {
          next();
      }
      else {
        res.send(403);
      }
    });
}

/**
 * Checks if the user is authorized for the class
 */
function hasClass(classToCheck) {
  if (!classToCheck) throw new Error('Class needs to be set');

  return compose()
    .use(isAuthenticated())
    .use(function meetsRequirements(req, res, next) {
      if (config.subjects.indexOf(classToCheck) === -1) {
        throw new Error('Class is invalid.')
      }
      else if (req.user.subjects.indexOf(classToCheck) >= -1) {
        next();
      }
      else {
        res.send(403);
      }
    });
}

/**
 * Returns a jwt token signed by the app secret
 */
function signToken(id) {
  return jwt.sign({ _id: id }, config.secrets.session, { expiresInMinutes: 60*5 });
}

/**
 * Set token cookie directly for oAuth strategies
 */
function setTokenCookie(req, res) {
  if (!req.user) {
    return res.status(404).json({ message: 'Something went wrong, please try again.'});
  }
  var token = signToken(req.user._id, req.user.role);

  res.cookie('token', JSON.stringify(token));
  res.redirect('/account');
}

/**
 * Reset stat counter for the home page account stats
 */
function resetStatCounter(req, res) {
  var resetDate = new Date(req.body.date);
  config.statDate = resetDate;
  console.log(resetDate);
  console.log(typeof resetDate);
  res.json(true);
}

function giveStatCounter(req, res) {
  res.json(config.statDate);
}

/**
 * Determines whether signup is restricted or not
 */
function isBeta(req, res) {
  res.json(config.isBeta)
}
exports.isAuthenticated = isAuthenticated;
exports.hasRole = hasRole;
exports.hasAdminOrTeacher = hasAdminOrTeacher;
exports.signToken = signToken;
exports.setTokenCookie = setTokenCookie;
exports.resetStatCounter = resetStatCounter;
exports.giveStatCounter = giveStatCounter;
exports.isBeta = isBeta;
exports.isOptionallyAuthenticated = isOptionallyAuthenticated;
