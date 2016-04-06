/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Classroom = require('./classroom.model');

exports.register = function(socket) {
  Classroom.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Classroom.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('classroom:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('classroom:remove', doc);
}