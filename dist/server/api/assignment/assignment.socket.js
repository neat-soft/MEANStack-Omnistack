/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Assignment = require('./assignment.model');

exports.register = function(socket) {
  Assignment.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Assignment.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('assignment:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('assignment:remove', doc);
}