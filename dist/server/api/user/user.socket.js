/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var User = require('./user.model');

exports.register = function(socket) {
  User.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  User.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  doc.hashedPassword = undefined;
  doc.salt = undefined;
  socket.emit('user:save', doc);
}

function onRemove(socket, doc, cb) {
  doc.hashedPassword = undefined;
  doc.salt = undefined;
  socket.emit('user:remove', doc);
}
