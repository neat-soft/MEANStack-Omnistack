/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Exam = require('./exam.model');

exports.register = function (socket) {
  Exam.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Exam.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
  Exam.on('addNotification', function (doc) {
    addNotification(socket, doc);
  });
  Exam.on('removeNotification', function (doc) {
    removeNotification(socket, doc);
  });
};

function onSave(socket, doc, cb) {
  socket.emit('exam:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('exam:remove', doc);
}

function addNotification(socket, doc, cb) {
  socket.emit('exam:addNotification', doc);
}

function removeNotification(socket, doc, cb) {
  socket.emit('exam:removeNotification', doc);
}