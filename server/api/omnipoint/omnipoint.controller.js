'use strict';

var _ = require('lodash');
var Omnipoint = require('./omnipoint.model');
var Chatmessage = require('../chatmessage/chatmessage.model');
var User = require('../user/user.controller');

// Get list of omnipoints
exports.index = function(req, res) {
  Omnipoint.find(function (err, omnipoints) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(omnipoints);
  });
};

// Get a single omnipoint
exports.show = function(req, res) {
  Omnipoint.findById(req.params.id, function (err, omnipoint) {
    if(err) { return handleError(res, err); }
    if(!omnipoint) { return res.send(404); }
    return res.json(omnipoint);
  });
};

// Creates a new omnipoint in the DB.
exports.create = function(req, res) {
  var omniPoint = req.body;
  omniPoint.timestamp = new Date(Date.now());
  Omnipoint.create(omniPoint, function(err, omnipoint) {
    if(err) { return handleError(res, err); }
    Chatmessage.findById(omniPoint.chatId, function (err, message) {
      if(err) { return handleError(res, err); }
      if(message){
        if(typeof message.votes==='undefined'){
          var vote = {};
          vote[req.user._id] = omniPoint.awardedFrom;
          message.votes = vote;
        }else{
          if (typeof message.votes[req.user._id] === 'undefined') {
            message.votes[req.user._id] = omniPoint.awardedFrom;
          } else {
            if (message.votes[req.user._id] == 'upvote' && omniPoint.awardedFrom == 'downvote') {
              message.votes[req.user._id] = 'novote';
            } else if (message.votes[req.user._id] == 'downvote' && omniPoint.awardedFrom == 'upvote') {
              message.votes[req.user._id] = 'novote';
            } else if (message.votes[req.user._id] == 'downvote' && omniPoint.awardedFrom == 'downvote') {
              return res.status(201).json(omnipoint);
            } else if (message.votes[req.user._id] == 'upvote' && omniPoint.awardedFrom == 'upvote') {
              return res.status(201).json(omnipoint);
            }
            else {
              message.votes[req.user._id] = omniPoint.awardedFrom;
            }
          }
        }
        message.markModified('votes');
        message.save(function (err) {
          if(err) { return handleError(res, err); }
          User.updateOmniPointsByEmail(req,res);
        });
      }else {
        return res.status(201).json(omnipoint);
      }
    });
  });
};

// Updates an existing omnipoint in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Omnipoint.findById(req.params.id, function (err, omnipoint) {
    if (err) { return handleError(res, err); }
    if(!omnipoint) { return res.send(404); }
    var omniPoint = req.body;
    omniPoint.timestamp = new Date(Date.now());
    var updated = _.merge(omnipoint, omniPoint);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(omnipoint);
    });
  });
};

// Deletes a omnipoint from the DB.
exports.destroy = function(req, res) {
  Omnipoint.findById(req.params.id, function (err, omnipoint) {
    if(err) { return handleError(res, err); }
    if(!omnipoint) { return res.send(404); }
    omnipoint.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}