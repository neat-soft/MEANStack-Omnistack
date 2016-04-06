'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ChatmessageSchema = new Schema({
  archive_id:String,
  name: String,
  email: String,
  message: String,
  omnipoints: Number,
  votes: {}, /*votes:{ userId: voteType }*/
  sentByUser: Boolean,
  roomID: String,
  info: String,
  active: Boolean,
  timestamp: Date
});

module.exports = mongoose.model('Chatmessage', ChatmessageSchema);