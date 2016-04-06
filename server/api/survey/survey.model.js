'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var SurveyChoiceSchema = new Schema({
  choiceContent: String,
  choiceTimesPicked: 0
});

var SurveyQuestionSchema = new Schema({
  questionContent: String,
  choices: [SurveyChoiceSchema]
});

var SurveySchema = new Schema({
  name: String,
  info: String,
  active: Boolean,
  questions: [SurveyQuestionSchema]
});

module.exports = mongoose.model('Survey', SurveySchema);
