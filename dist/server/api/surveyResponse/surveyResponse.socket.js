/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var SurveyResponse = require('./surveyResponse.model');

exports.register = function(socket) {
  SurveyResponse.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  SurveyResponse.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('surveyResponse:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('surveyResponse:remove', doc);
}