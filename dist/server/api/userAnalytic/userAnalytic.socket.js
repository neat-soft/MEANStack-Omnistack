/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var UserAnalytic = require('./userAnalytic.model');

exports.register = function(socket) {
  UserAnalytic.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  UserAnalytic.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('userAnalytic:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('userAnalytic:remove', doc);
}