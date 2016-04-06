/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Token = require('./token.model');

exports.register = function(socket) {
  Token.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Token.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('token:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('token:remove', doc);
}