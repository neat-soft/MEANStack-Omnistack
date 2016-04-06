'use strict';

var _ = require('lodash');
var Chatmessage = require('./chatmessage.model');
var User = require('../user/user.model');
var async = require('async');

// Get list of chatmessages
exports.index = function (req, res) {
  Chatmessage.find()
    .sort({timestamp: 1})
    .exec(function (err, chatmessages) {
      if (err) {
        return handleError(res, err);
      }
      //get previous omnipoints for each chat message
      var allChats=[];
      //used "mapSeries" to keep the original order
      async.mapSeries(chatmessages, function (chat, callback) {
        User.findOne({
          email: chat.email
        },'omnipoints', function (err, user) {
          if (err) return next(err);
          chat.omnipoints = user.omnipoints;
          allChats.push(chat);
          callback();
        });
      },function (err) {
        if (err) {
          return handleError(res, err);
        } else {
          return res.status(200).json(allChats);
        }
      });
    }
  );
};

// Get a single chatmessage
exports.show = function (req, res) {
  Chatmessage.findById(req.params.id, function (err, chatmessage) {
    if (err) {
      return handleError(res, err);
    }
    if (!chatmessage) {
      return res.send(404);
    }
    return res.json(chatmessage);
  });
};

// Creates a new chatmessage in the DB.
exports.create = function (req, res) {
  Chatmessage.create(req.body, function (err, chatmessage) {
    if (err) {
      return handleError(res, err);
    } else {
      Chatmessage.find({'roomID': req.body.roomID})
        .sort({timestamp: 1})
        .exec(function (err, chatmessages) {
          if (chatmessages.length > 29) {
            for (var i = 0, j = (chatmessages.length - 29); i < j; ++i) {
              Chatmessage.findById(chatmessages[i]._id, function (err, chatmessage) {
                chatmessage.remove();
              });
            }
          }
        });
      return res.status(201).json(chatmessage);
    }
  });
};

// Updates an existing chatmessage in the DB.
exports.update = function (req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  Chatmessage.findById(req.params.id, function (err, chatmessage) {
    if (err) {
      return handleError(res, err);
    }
    if (!chatmessage) {
      return res.send(404);
    }
    var updated = _.merge(chatmessage, req.body);
    updated.save(function (err) {
      if (err) {
        return handleError(res, err);
      }
      return res.status(200).json(chatmessage);
    });
  });
};

// Deletes a chatmessage from the DB.
exports.destroy = function (req, res) {
  Chatmessage.findById(req.params.id, function (err, chatmessage) {
    if (err) {
      return handleError(res, err);
    }
    if (!chatmessage) {
      return res.send(404);
    }
    chatmessage.remove(function (err) {
      if (err) {
        return handleError(res, err);
      }
      return res.send(204);
    });
  });
};

// Deletes aall chatmessage by email id from the DB.
exports.destroyByEmail = function (req, res) {
  Chatmessage.find({email: req.params.email}, function (err, chatmessage) {
    if (err) {
      return handleError(res, err);
    }
    if (!chatmessage) {
      return res.send(404);
    }
    for (var i = 0; i < chatmessage.length; ++i) {
      chatmessage[i].remove(function (err) {
        if (err) {
          return handleError(res, err);
        }
      });
    }
    return res.send(204);
  });
};

function handleError(res, err) {
  return res.send(500, err);
}