/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Email = require('./email.model');

exports.register = function(socket) {
  Email.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Email.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('email:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('email:remove', doc);
}