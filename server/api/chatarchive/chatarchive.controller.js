'use strict';

var _ = require('lodash');
var Chatarchive = require('./chatarchive.model');
var Chatmessage = require('../chatmessage/chatmessage.model');
var Omnipoint = require('../omnipoint/omnipoint.model');
var User = require('../user/user.model');
var emailService = require('../email/email.controller');
var Settings = require('../settings/settings.model');
var jsonfile = require('jsonfile');
var mkdirp = require('mkdirp');
var mime = require('mime');
var path = require('path');
var fs = require('fs');

// Get list of chatarchives
exports.index = function (req, res) {
  var msgPerPage = parseInt(req.params.limit);
  var page = parseInt(req.params.page);
  Chatarchive.find({roomID: req.params.room})
    .count()
    .exec(function (err, count) {
      if (err) {
        return handleError(res, err);
      }
      if (!count) {
        return res.send(404);
      }
      var skip = (count - (msgPerPage * page));
      Chatarchive.find({roomID: req.params.room})
        .limit(msgPerPage)
        .skip((skip > 0) ? skip : 0)
        .sort({timestamp: 1})
        .exec(function (err, chatarchives) {
          if (err) {
            return handleError(res, err);
          }
          if (!chatarchives) {
            return res.send(404);
          }
          return res.status(200).json({count: (skip > 0) ? count : 0, messages: chatarchives});
        });
    });
};

// Get a single chatarchive
exports.show = function (req, res) {
  Chatarchive.findById(req.params.id, function (err, chatarchive) {
    if (err) {
      return handleError(res, err);
    }
    if (!chatarchive) {
      return res.send(404);
    }
    return res.json(chatarchive);
  });
};

// Creates a new chatarchive in the DB.
exports.create = function (req, res) {
  //Save chat messages to chatarchives collection
  var chat = req.body;
  chat.timestamp = new Date(Date.now());
  Chatarchive.create(chat, function (err, chatarchive) {
    if (err) { return handleError(res, err); }
    var omniPoint = {email: chat.email, points: chat.points, awardedFrom: chat.awardedFrom, timestamp: new Date(Date.now())};
    var userId = chat.userID;
    var points = chat.points;
    chat.archive_id = chatarchive._id;

    //Save omnipoints
    Omnipoint.create(omniPoint, function(err, omnipoint) {
      if(err) { return handleError(res, err); }
      //Save chat messages to chatmessage collection
      Chatmessage.create(chat, function (err, chatmessage) {
        if (err) {
          return handleError(res, err);
        } else {
          //Update Omnipoints
          User.findById(userId, function (err, user) {
            user.omnipoints = user.omnipoints + (points);
            user.save(function (err) {
              if (err) return handleError(res, err);
              return res.status(201).json(chatmessage);
            });
          });
          //Remove old messages
          Chatmessage.find({roomID: chat.roomID})
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
          //Send Admin Chat Notification
          Settings.findOne({'name': 'adminChatNotification'}, function(err, status) {
            if(err) { return handleError(res, err); }
            if (status) {
              if (status.info.active === true) {
                if (chat.sentByUser) {
                  User.findOne({
                    email: chat.email
                  }, function (err, user) {
                    if (err) return handleError(res, err);
                    var userObj = {firstName: getFirstName(chat), message: chat.message, userEmail: chat.email};
                    emailService.sendChatNotification(userObj, function (error, response) {
                      if (error) {
                        console.log('Cannot Send Chat Notification');
                        console.log(error);
                        return handleError(response, error);
                      }
                      console.log(response);
                    });
                  });
                }
              }
            }
          });
        }
      });
    });
  });
};

// Updates an existing chatarchive in the DB.
exports.update = function (req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  Chatarchive.findById(req.params.id, function (err, chatarchive) {
    if (err) {
      return handleError(res, err);
    }
    if (!chatarchive) {
      return res.send(404);
    }
    var updated = _.merge(chatarchive, req.body);
    updated.save(function (err) {
      if (err) {
        return handleError(res, err);
      }
      return res.status(200).json(chatarchive);
    });
  });
};

// Deletes a chatarchive from the DB.
exports.destroy = function (req, res) {
  Chatarchive.findById(req.params.id, function (err, chatarchive) {
    if (err) {
      return handleError(res, err);
    }
    if (!chatarchive) {
      return res.send(404);
    }
    chatarchive.remove(function (err) {
      if (err) {
        return handleError(res, err);
      }
      return res.send(204);
    });
  });
};

// Export To JSON
exports.exportToJSON = function (req, res) {
  Chatarchive.find({}, function (err, chatarchives) {
    if (err) {
      return handleError(res, err);
    }
    mkdirp('server/data', function (err) {
      if (err) {
        return handleError(res, err);
      }
      var fileName = 'chatarchive_' + req.user._id + '_' + Date.now() + '.json';
      var file = 'server/data/' + fileName;
      jsonfile.writeFile(file, chatarchives, function (err) {
        if (err) {
          return handleError(res, err);
        }
        return res.json({fileName: fileName});
      })
    });
  });
};

// Download To JSON
exports.downloadJSON = function (req, res) {
  var file = 'server/data/' + req.params.fileName;
  var filename = path.basename(file);
  var mimetype = mime.lookup(file);

  res.setHeader('Content-disposition', 'attachment; filename=' + filename);
  res.setHeader('Content-type', mimetype);

  var filestream = fs.createReadStream(file);
  filestream.pipe(res);
  filestream.on('end', function () {
    fs.unlinkSync(file);
  });
  filestream.on('error', function (err) {
    res.send(500, err);
  });
};

function handleError(res, err) {
  return res.send(500, err);
}

function getFirstName(chat) {
  if (chat.sentByUser) {
    if ((chat.name.split(' ').length > 1)) {
      return chat.name.split(' ')[0] + ' ' + chat.name.split(' ')[1].substr(0, 1) + '.';
    } else {
      return chat.name;
    }
  }
}