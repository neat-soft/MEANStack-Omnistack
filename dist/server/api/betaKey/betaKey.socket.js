/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var BetaKey = require('./betaKey.model');

exports.register = function(socket) {
  BetaKey.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  BetaKey.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('betaKey:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('betaKey:remove', doc);
}