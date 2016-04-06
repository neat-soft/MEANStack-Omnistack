/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Chatarchive = require('./chatarchive.model');

exports.register = function(socket) {
  Chatarchive.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Chatarchive.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('chatarchive:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('chatarchive:remove', doc);
}