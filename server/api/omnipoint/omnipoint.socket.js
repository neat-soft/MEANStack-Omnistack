/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Omnipoint = require('./omnipoint.model');

exports.register = function(socket) {
  Omnipoint.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Omnipoint.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('omnipoint:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('omnipoint:remove', doc);
}