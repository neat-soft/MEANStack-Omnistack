'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ShareSchema = new Schema({
  name: String,
  info: String,
  active: Boolean
});

module.exports = mongoose.model('Share', ShareSchema);