'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var getCurrentDate = function() {
  return Date.now();
}

var QuestionCommentSchema = new Schema({
  userId: String,
  user: String,
  comment: String,
  date: {
    type: Date,
    default: getCurrentDate()
  }
});

var ChoiceSchema = new Schema({
  body: String,
  correct: Boolean,
  timesPicked: {
    type: Number,
    default: 0
  },
  timesShown: {
    type: Number,
    default: 0
  },
  images: {}
});

var QuestionSchema = new Schema({
  subject: String,
  author: Schema.Types.ObjectId,
  authorEmail: String,
  oldId: String,
  value: {
    type: Number,
    default: 1
  },
  examNumber: Number,
  body: String,
  part: Number,
  answer: String,
  topics: String,//[],  //RG_MODIFIED
  explanation: {
    contentId: String,
    body: {type: String, required: true},
    images: {}
  },
  images: {},
  comments: [QuestionCommentSchema],
  choices: [ChoiceSchema],
  timesSkipped: {
    type: Number,
    default: 0
  },
  timesAnswered: {
    type: Number,
    default: 0
  },
  tags: [String],
  type: String,
  score: {
    type: Number,
    default: 0
  },
  votes: {}
});

module.exports = mongoose.model('Question', QuestionSchema);
