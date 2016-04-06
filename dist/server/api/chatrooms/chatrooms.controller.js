'use strict';

var _ = require('lodash');
var Chatrooms = require('./chatrooms.model');

// Get list of chatroomss
exports.index = function(req, res) {
  Chatrooms.find(function (err, chatroomss) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(chatroomss);
  });
};

// Get a single chatrooms
exports.show = function(req, res) {
  Chatrooms.findById(req.params.id, function (err, chatrooms) {
    if(err) { return handleError(res, err); }
    if(!chatrooms) { return res.send(404); }
    return res.json(chatrooms);
  });
};

// Creates a new chatrooms in the DB.
exports.create = function(req, res) {
  Chatrooms.create(req.body, function(err, chatrooms) {
    if(err) { return handleError(res, err); }
    return res.status(201).json(chatrooms);
  });
};

// Updates an existing chatrooms in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Chatrooms.findById(req.params.id, function (err, chatrooms) {
    if (err) { return handleError(res, err); }
    if(!chatrooms) { return res.send(404); }
    var updated = _.merge(chatrooms, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(chatrooms);
    });
  });
};

// Deletes a chatrooms from the DB.
exports.destroy = function(req, res) {
  Chatrooms.findById(req.params.id, function (err, chatrooms) {
    if(err) { return handleError(res, err); }
    if(!chatrooms) { return res.send(404); }
    chatrooms.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}