'use strict';

var _ = require('lodash');
var SurveyResponse = require('./surveyResponse.model');

// Get list of surveyResponses
exports.index = function(req, res) {
  SurveyResponse.find(function (err, surveyResponses) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(surveyResponses);
  });
};

// Get a single surveyResponse
exports.show = function(req, res) {
  SurveyResponse.findById(req.params.id, function (err, surveyResponse) {
    if(err) { return handleError(res, err); }
    if(!surveyResponse) { return res.send(404); }
    return res.json(surveyResponse);
  });
};

// Creates a new surveyResponse in the DB.
exports.create = function(req, res) {
  var surveyRes = req.body;
  var responses = {};
  for (var i = 0; i < surveyRes.questions.length; i++) {
    responses[surveyRes.questions[i]._id] = {
      choice: surveyRes.questions[i].selection._id,
      explanation: surveyRes.questions[i].explanation
    }
  }
  SurveyResponse.findOne({userId: req.user.id, surveyId: surveyRes._id}, function(err, response) {
    if (response) {
      var newResponses = _.merge(response.responses, responses, function(a,b) {return b});
      SurveyResponse.update({_id: response._id}, {responses: newResponses}, function(err, updated) {
        if (err) { return handleError(res, err); }
        return res.json (200, response)
      });
    }
    else {
      var newResponse = new SurveyResponse();
      newResponse.responses = responses;
      newResponse.surveyId = surveyRes._id;
      newResponse.userId = req.user.id;
      newResponse.save(function(err) {
        if (err) {
          return handleError(res, err);
        }
        return res.status(201).json(response);
      })
    }
  })
};

// Updates an existing surveyResponse in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  SurveyResponse.findById(req.params.id, function (err, surveyResponse) {
    if (err) { return handleError(res, err); }
    if(!surveyResponse) { return res.send(404); }
    var updated = _.merge(surveyResponse, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(surveyResponse);
    });
  });
};

// Deletes a surveyResponse from the DB.
exports.destroy = function(req, res) {
  SurveyResponse.findById(req.params.id, function (err, surveyResponse) {
    if(err) { return handleError(res, err); }
    if(!surveyResponse) { return res.send(404); }
    surveyResponse.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}
