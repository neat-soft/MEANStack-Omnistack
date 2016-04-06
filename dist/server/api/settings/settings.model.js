'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var SettingsSchema = new Schema({
  name: String,
  info: {
    /*Defined to get socket updates*/
    date:Date,
    active:Boolean,
    subjects: []
  }
});

module.exports = mongoose.model('Settings', SettingsSchema);
