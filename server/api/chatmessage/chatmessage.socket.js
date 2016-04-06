/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Chatmessage = require('./chatmessage.model');

exports.register = function(socket) {
  Chatmessage.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Chatmessage.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('chatmessage:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('chatmessage:remove', doc);
}