'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ChoiceSchema = new Schema ({
  body: {type: String, required: true},
  correct: {type: Boolean, required: true},
  timesDisplayed: {type: Number, default: 0},
  timesSelected: {type: Number, default: 0},
  images: {}
});

var ExamSchema = new Schema ({
  subject: {type: String, required: true},
  dateCreated: { type: Date, default: Date.now },
  examNumber: Number,
  section1: {
    part1: {
      timeInMinutes: Number,
      instructions: {type: String, required: true},
      fullQuestions: [],
      questionIds: []
    },
    part2: {
      timeInMinutes: Number,
      instructions: {type: String, required: false},
      fullQuestions: [],
      questionIds: []
    }
  },
  section2: {}
});

module.exports = mongoose.model('Exam', ExamSchema);
