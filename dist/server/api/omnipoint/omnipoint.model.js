'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var OmnipointSchema = new Schema({
  email: String,
  points: Number,
  awardedFrom: String, //upvote, message, number
  timestamp: Date
});

module.exports = mongoose.model('Omnipoint', OmnipointSchema);