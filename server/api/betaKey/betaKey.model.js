'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var BetaKeySchema = new Schema({
  email: String,
  name: String,
  role: String,
  expires: {
    type: Date,
    default: function() {
      var twoWks = new Date(Date.now() + 1000*60*60*24*14);
      return twoWks;
    }
  },
  numClaimed: {
    type: Number,
    default: 0
  },
  massKey: {
    type: Boolean,
    default: false
  },
  approved: {
    type: Boolean,
    default: false
  },
  academicRole: {
    type: String,
    default: 'Any'
  }
});

module.exports = mongoose.model('BetaKey', BetaKeySchema);
