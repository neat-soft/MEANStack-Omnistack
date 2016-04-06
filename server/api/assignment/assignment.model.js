'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    shortId = require('shortid');

var AssignmentSchema = new Schema({
  name: String,
  type: {
    type: String,
    default: 'Assignment'
  },
  pointsPossible: Number,
  questions: [{ type: Schema.Types.ObjectId, ref: 'Question' }],
  author: Schema.Types.ObjectId,
  subject: {},
  topic: String, //RG_ADD_3_7
  questionNumber: Number, //RG_ADD_3_7
  code: {
    type: String,
    unique: true,
    sparse: true,
    'default': shortId.generate
  }
});

module.exports = mongoose.model('Assignment', AssignmentSchema);
