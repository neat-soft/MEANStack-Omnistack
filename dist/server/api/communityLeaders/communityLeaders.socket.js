/**
 * Broadcast updates to client when the model changes
 */

'use strict';

exports.register = function(socket) {

}

function onSave(socket, doc, cb) {
  socket.emit('communityLeaders:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('communityLeaders:remove', doc);
}
