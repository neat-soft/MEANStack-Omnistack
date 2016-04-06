'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var ResponseSchema = new Schema({
  questionId: {
    type: Schema.Types.ObjectId,
    ref: 'Question'
  },
  choiceId: [{
    type: String
  }]
});

var ExamResponseSchema = new Schema({
  examId: {
    type: Schema.Types.ObjectId,
    ref: 'Exam'
  },
  score: {
    type: Number
  },
  timeSpent: {
    type: Number
  },
  responses: [ResponseSchema]
});

var UserAnalyticSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  examResponses: [ExamResponseSchema],
  questionResponses: {
    type: Object
  }
});

module.exports = mongoose.model('UserAnalytic', UserAnalyticSchema);