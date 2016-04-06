'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var SurveyResponseSchema = new Schema({
  surveyId: String,
  userId: String,
  responses: {
    /*
    questionId: choiceId
    */
  }
});

module.exports = mongoose.model('SurveyResponse', SurveyResponseSchema);
