'use strict';

var _ = require('lodash');
var Survey = require('./survey.model');
var SurveyResponse = require('../surveyResponse/surveyResponse.model');
// Get list of surveys
exports.index = function(req, res) {
  Survey.find(function (err, surveys) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(surveys);
  });
};

exports.userSurvey = function(req, res) {
  var userId = req.params.id;
  // Find active surveys
  Survey.find({active: true}, function(err, surveys) {
    // Find any of the user's responses to the active surveys
    var activeIds = [];
    for (var i = 0; i < surveys.length; i++) {
      activeIds.push(surveys[i]._id);
    }
    SurveyResponse.find({userId: userId, surveyId: {$in: activeIds}}, function(err, responses) {
      var prunedSurveys = [];
      for (var i = 0; i < surveys.length; i++) {
        //See if Survey has been responded to already
        for (var j = 0; j < responses.length; j++) {
          if (String(surveys[i]._id) === String(responses[j].surveyId)) {
            // Survey already has a response. Prune answered questions.
            var prunedQuestions = [];
            var resQs = Object.keys(responses[j].responses);
            for (var k = 0; k < surveys[i].questions.length; k++) {
              if (resQs.indexOf(String(surveys[i].questions[k]._id)) === -1) {
                // Question not answered. Can be passed to prunedQuestions
                prunedQuestions.push(surveys[i].questions[k]);
              }
            }
            surveys[i].questions = prunedQuestions;
          }
        }
        if (surveys[i].questions.length > 0) {
          // This survey hasn't been fully answered.
          prunedSurveys.push(surveys[i]);
        }
      }
      //Surveys Pruned. Now pick a survey and question to ask.
      if (prunedSurveys.length > 0) {
        var randSurvey = prunedSurveys[Math.floor(Math.random()*prunedSurveys.length)];
        var randQuestion = randSurvey.questions[Math.floor(Math.random()*randSurvey.questions.length)];
        randSurvey.questions = [randQuestion];
        return res.status(200).json(randSurvey);
      }
      else {
        return res.status(404).json({});
      }
    });
  });
}

// Get list of surveys that are active
exports.indexActive = function(req, res) {
  Survey.find({active: true}, function (err, surveys) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(surveys);
  });
};

// Get a single survey
exports.show = function(req, res) {
  Survey.findById(req.params.id, function (err, survey) {
    if(err) { return handleError(res, err); }
    if(!survey) { return res.send(404); }
    return res.json(survey);
  });
};

// Creates a new survey in the DB.
exports.create = function(req, res) {
  Survey.create(req.body, function(err, survey) {
    if(err) { return handleError(res, err); }
    return res.status(201).json(survey);
  });
};

exports.disable = function(req, res) {
  Survey.update({_id: req.params.id}, {active: false}, function (err, survey) {
    if (err) { return handleError(res, err); }
    return res.status(200).json(survey);
  });
}
exports.enable = function(req, res) {
  Survey.update({_id: req.params.id}, {active: true}, function (err, survey) {
    if (err) { return handleError(res, err); }
    return res.status(200).json(survey);
  });
}

// Updates an existing survey in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Survey.findById(req.params.id, function (err, survey) {
    if (err) { return handleError(res, err); }
    if(!survey) { return res.send(404); }
    var updated = _.merge(survey, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(survey);
    });
  });
};

// Deletes a survey from the DB.
exports.destroy = function(req, res) {
  Survey.findById(req.params.id, function (err, survey) {
    if(err) { return handleError(res, err); }
    if(!survey) { return res.send(404); }
    survey.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}
