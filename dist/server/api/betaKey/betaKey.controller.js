'use strict';

var _ = require('lodash');
var BetaKey = require('./betaKey.model');
var User = require('../user/user.model');
// Get list of betaKeys
exports.index = function(req, res) {
  BetaKey.find(function (err, betaKeys) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(betaKeys);
  });
};

// Get a single betaKey
exports.show = function(req, res) {
  BetaKey.find({"name": req.params.id}, function (err, betaKey) {
    if(err) { return handleError(res, err); }
    if(!betaKey) { return res.send(404); }
    return res.json(betaKey);
  });
};

// Uses a betaKey
exports.use = function(req, res) {
  console.log("Trying to use");
  BetaKey.findOneAndUpdate({"name": req.params.id}, {$inc: {"numClaimed": 1}}, function(err) {
    if (err) {res.send(500, err)}
    res.send(300);
  })
}

// Validates betaKey
exports.validate = function(req, res) {
  var key = req.params.key;
  BetaKey.findOne({name: key}, function(err, betaKey) {
    if(err) { return handleError(res, err); }
    if (!betaKey) { return handleError(res, "invalid")}
    if (betaKey.numClaimed > 0 && !betaKey.massKey) { return handleError(res, "claimed")}
    if (!betaKey.approved) { return handleError(res, "unapproved")}
    var now = new Date(Date.now());
    if (betaKey.expires < now) { return handleError(res, "expired")}
    return res.status(200).json(betaKey);
  });
};
// Creates a new betaKey in the DB.
exports.create = function(req, res) {
  var betaKey = req.body;
  betaKey.createdDate = new Date(Date.now());
  betaKey.expired = new Date(Date.now()+60*60*24*10*1000)
  if (!betaKey.name) {
    betaKey.name = genKey();
  }
  User.findOne({email: betaKey.email}, function(err, user) {
    if (!user) {
      BetaKey.create(betaKey, function(err, betaKey) {
        if(err) { return handleError(res, err); }
        return res.status(201).json(betaKey);
      });
    }
    else {
      return res.status(344).json("Email in use");
    }
  });
};

// Updates an existing betaKey in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  BetaKey.findById(req.params.id, function (err, betaKey) {
    if (err) { return handleError(res, err); }
    if(!betaKey) { return res.send(404); }
    var updated = _.merge(betaKey, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(betaKey);
    });
  });
};

// Deletes a betaKey from the DB.
exports.destroy = function(req, res) {
  BetaKey.findById(req.params.id, function (err, betaKey) {
    if(err) { return handleError(res, err); }
    if(!betaKey) { return res.send(404); }
    betaKey.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

// Deletes all claimed keys from the DB.
exports.destroyClaimed = function(req, res) {
  BetaKey.find({massKey: false, numClaimed: 1}, function(err, keys) {
    if (err) { return handleError(res, err); }
    if (keys.length === 0) { return res.send(404); }
    for (var i = 0; i < keys.length; i++) {
      keys[i].remove();
    }
    return res.send(204);
  });
}

// Deletes all expired keys from the DB.
exports.destroyExpired = function(req, res) {
  var nowDate = new Date(Date.now());
  console.log(typeof nowDate);
  BetaKey.findOne({}, function(err, betaKey) {
    console.log(typeof betaKey.expires);
  })
  BetaKey.find({"expires": {"$lte": nowDate}}, function(err, keys) {
    if (err) { return handleError(res, err); }
    if (keys.length === 0) { return res.send(404); }
    for (var i = 0; i < keys.length; i++) {
      keys[i].remove();
    }
    return res.send(204);
  });
}

function handleError(res, err) {
  return res.send(500, err);
}

function genKey() {
  //Generates a random key
  return "key";
}
