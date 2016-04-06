/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Blockuser = require('./blockuser.model');

exports.register = function(socket) {
  Blockuser.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Blockuser.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('blockuser:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('blockuser:remove', doc);
}