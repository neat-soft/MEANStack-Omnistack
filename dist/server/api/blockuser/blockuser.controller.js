'use strict';

var _ = require('lodash');
var Blockuser = require('./blockuser.model');

// Get list of blockusers
exports.index = function(req, res) {
  Blockuser.find(function (err, blockusers) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(blockusers);
  });
};

// Get a single blockuser
exports.show = function(req, res) {
  Blockuser.findById(req.params.id, function (err, blockuser) {
    if(err) { return handleError(res, err); }
    if(!blockuser) { return res.send(404); }
    return res.json(blockuser);
  });
};

// Get a single blockuser by Email
exports.getByEmail = function(req, res) {
  Blockuser.find({email:req.params.email}, function (err, blockuser) {
    if(err) { return handleError(res, err); }
    if(!blockuser) { return res.send(404); }
    return res.json(blockuser);
  });
};

// Creates a new blockuser in the DB.
exports.create = function(req, res) {

  Blockuser.find({email:req.body.email})
    .count()
    .exec(function (err, count) {
    if(err) { return handleError(res, err); }
      if(count<=0) {
      Blockuser.create(req.body, function(err, blockuser) {
        if(err) { return handleError(res, err); }
        return res.status(201).json(blockuser);
      });
    }
  });
};

// Updates an existing blockuser in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Blockuser.findById(req.params.id, function (err, blockuser) {
    if (err) { return handleError(res, err); }
    if(!blockuser) { return res.send(404); }
    var updated = _.merge(blockuser, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(blockuser);
    });
  });
};

// Deletes a blockuser from the DB.
exports.destroy = function(req, res) {
  Blockuser.findById(req.params.id, function (err, blockuser) {
    if(err) { return handleError(res, err); }
    if(!blockuser) { return res.send(404); }
    blockuser.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}