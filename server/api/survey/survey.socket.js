/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Survey = require('./survey.model');

exports.register = function(socket) {
  Survey.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Survey.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('survey:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('survey:remove', doc);
}