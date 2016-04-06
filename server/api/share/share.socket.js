/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Share = require('./share.model');

exports.register = function(socket) {
  Share.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Share.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('share:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('share:remove', doc);
}