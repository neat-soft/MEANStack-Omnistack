'use strict';

var _ = require('lodash');
var User = require('../user/user.model');

// Get list of communityLeaderss
exports.index = function(req, res) {
  User.find()
    .where('referral.usersReferredCount').gt(0)
    .sort('-referral.usersReferredCount')
    .limit(10)
    .exec(function (err, betaKeys) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(betaKeys);
  });
};

exports.myrank = function(req, res) {
  var threshold = req.user.referral.usersReferredCount || 0;
  User.aggregate(
    { $match : { 'referral.usersReferredCount' : { $gt : threshold } } },
    { $group: { _id: '$referral.usersReferredCount' } }
    , function (err, array) {
      if(err) { return handleError(res, err); }
        return res.status(200).json({ myrank: array.length + 1 });
    });
};

function handleError(res, err) {
  return res.send(500, err);
}
