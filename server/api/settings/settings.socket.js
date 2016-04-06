/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Settings = require('./settings.model');

exports.register = function(socket) {
  Settings.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Settings.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('settings:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('settings:remove', doc);
}