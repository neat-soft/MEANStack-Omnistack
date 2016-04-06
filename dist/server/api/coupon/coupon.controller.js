'use strict';

var _ = require('lodash');
var Coupon = require('./coupon.model');

// Get list of coupons
exports.index = function(req, res) {
  Coupon.find(function (err, coupons) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(coupons);
  });
};

// Get a single coupon
exports.show = function(req, res) {
  Coupon.findById(req.params.id, function (err, coupon) {
    if(err) { return handleError(res, err); }
    if(!coupon) { return res.send(404); }
    return res.json(coupon);
  });
};

// Creates a new coupon in the DB.
exports.create = function(req, res) {
  Coupon.create(req.body, function(err, coupon) {
    if(err) { return handleError(res, err); }
    return res.status(201).json(coupon);
  });
};

// Updates an existing coupon in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Coupon.findById(req.params.id, function (err, coupon) {
    if (err) { return handleError(res, err); }
    if(!coupon) { return res.send(404); }
    var updated = _.merge(coupon, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(coupon);
    });
  });
};

// Deletes a coupon from the DB.
exports.destroy = function(req, res) {
  Coupon.findById(req.params.id, function (err, coupon) {
    if(err) { return handleError(res, err); }
    if(!coupon) { return res.send(404); }
    coupon.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

exports.getByCode = function(req, res) {
  Coupon.findOne({ code: req.params.code }, function(err, coupon) {
    if (!coupon) {
      return res.status(404).json({message: 'No coupon with that code exists.'});
    }
    if(coupon.expires < new Date().getTime() || coupon.numClaimed >= coupon.totalNumber){
      return res.status(404).json({message: 'Coupon has exceeded usage limit or has expired.'});
    }
    res.json(coupon);
  });
};

// Uses a coupon
exports.use = function(req, res) {
  Coupon.findOneAndUpdate({"code": req.params.code}, {$inc: {"numClaimed": 1}}, function(err) {
    if (err) {res.send(500, err)}
    res.send(300);
  })
}

// Deletes all claimed keys from the DB.
exports.destroyLimitReached = function(req, res) {
  Coupon.find({
    $where : "this.numClaimed == this.totalNumber"
  }, function(err, coupons) {
    if (err) {
      console.log(err);
      return handleError(res, err);
    }
    if (coupons.length === 0) { return res.send(404); }
    for (var i = 0; i < coupons.length; i++) {
      coupons[i].remove();
    }
    return res.send(204);
  });
};

// Deletes all expired keys from the DB.
exports.destroyExpired = function(req, res) {
  var nowDate = new Date(Date.now());

  Coupon.find({"expires": {"$lte": nowDate}}, function(err, coupons) {
    if (err) { return handleError(res, err); }
    if (coupons.length === 0) { return res.send(404); }
    for (var i = 0; i < coupons.length; i++) {
      coupons[i].remove();
    }
    return res.send(204);
  });
};

function handleError(res, err) {
  return res.send(500, err);
}
