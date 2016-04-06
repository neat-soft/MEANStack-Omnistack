'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var BlockuserSchema = new Schema({
  name: String,
  email: String,
  type: Number,// 1:Temporary, 2:Permanent
  message: String, //Chat ID
  timestamp: Date
});

module.exports = mongoose.model('Blockuser', BlockuserSchema);