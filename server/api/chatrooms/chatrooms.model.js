'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ChatroomsSchema = new Schema({
  name: String,
  roomType: String,
  info: String,
  createdBy: String,
  active: Boolean,
  timestamp: Date
});

module.exports = mongoose.model('Chatrooms', ChatroomsSchema);