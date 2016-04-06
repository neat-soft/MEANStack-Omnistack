'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ChatarchiveSchema = new Schema({
  name: String,
  email: String,
  message: String,
  sentByUser: Boolean,
  roomID: String,
  info: String,
  active: Boolean,
  timestamp: Date
});

module.exports = mongoose.model('Chatarchive', ChatarchiveSchema);