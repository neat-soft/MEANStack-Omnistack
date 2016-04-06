'use strict';

var _ = require('lodash');
var UserAnalytic = require('./userAnalytic.model');
var ExamController = require('../exam/exam.controller');
var async = require('async');

// Get list of userAnalytics
exports.index = function(req, res) {
  UserAnalytic.find(function (err, userAnalytics) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(userAnalytics);
  });
};

// Get a single userAnalytic
exports.show = function(req, res) {
  UserAnalytic.findById(req.params.id, function (err, userAnalytic) {
    if(err) { return handleError(res, err); }
    if(!userAnalytic) { return res.send(404); }
    return res.json(userAnalytic);
  });
};

// Creates a new userAnalytic in the DB.
exports.create = function(req, res) {
  UserAnalytic.findOne({'userId': req.user._id}, function (err, userAnalytic) {
    if (err) { return handleError(res, err); }
    if (!userAnalytic) {
      console.log('exam not found; creating new entry');
      UserAnalytic.create({
        'userId': req.user._id,
        'examResponses': [req.body.userAnalytics.examResponses],
        'questionResponses': req.body.userAnalytics.questionResponses
      }, function (err) {
        if(err) { return handleError(res, err); }
        ExamController.removeNotificationsInternally({userId: req.user._id, name: req.user.name, wellWishers: req.body.wellWishers, exam: req.body.exam}, function () {
          return res.status(201).json({});
        });
      });
    } else {
      console.log('exam found; pushing a new entry');
      if(req.body._id) { delete req.body._id; }
      var userAnalytics = req.body.userAnalytics;
      var updated = _.merge(userAnalytic, userAnalytics, function (a, b) {
        if (_.isArray(a)) {
          return a.concat(b);
        }
      });
      updated.markModified('questionResponses');
      updated.save(function (err, result) {
        if (err) {
          return handleError(res, err);
        }
        ExamController.removeNotificationsInternally({userId: req.user._id, name: req.user.name, wellWishers: req.body.wellWishers, exam: req.body.exam}, function () {
          return res.json(200);
        });
      });
    }
  });
};

// Updates an existing userAnalytic in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  UserAnalytic.findById(req.params.id, function (err, userAnalytic) {
    if (err) { return handleError(res, err); }
    if(!userAnalytic) { return res.send(404); }
    var updated = _.merge(userAnalytic, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(userAnalytic);
    });
  });
};

// Deletes a userAnalytic from the DB.
exports.destroy = function(req, res) {
  UserAnalytic.findById(req.params.id, function (err, userAnalytic) {
    if(err) { return handleError(res, err); }
    if(!userAnalytic) { return res.send(404); }
    userAnalytic.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}