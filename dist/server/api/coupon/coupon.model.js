'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var CouponSchema = new Schema({
  code: {type: String, required: true},
  subjectName: {type: String, required: true},
  numClaimed: {type: Number, default: 0},
  totalNumber: {type: Number, required: true},
  expires: Date
});

module.exports = mongoose.model('Coupon', CouponSchema);
