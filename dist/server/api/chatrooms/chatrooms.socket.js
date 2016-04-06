/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Chatrooms = require('./chatrooms.model');

exports.register = function(socket) {
  Chatrooms.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Chatrooms.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('chatrooms:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('chatrooms:remove', doc);
}