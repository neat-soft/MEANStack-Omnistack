/**
 * Socket.io configuration
 */

'use strict';

var config = require('./environment');

// When the user disconnects.. perform this
function onDisconnect(socket) {
}

// When the user connects.. perform this
function onConnect(socket) {
  // When the client emits 'info', this listens and executes
  socket.on('info', function (data) {
    console.info('[%s] %s', socket.address, JSON.stringify(data, null, 2));
  });

  // Insert sockets below
  require('../api/assignment/assignment.socket').register(socket);
  require('../api/classroom/classroom.socket').register(socket);
  require('../api/userAnalytic/userAnalytic.socket').register(socket);
  require('../api/question/question.socket').register(socket);
  require('../api/surveyResponse/surveyResponse.socket').register(socket);
  require('../api/survey/survey.socket').register(socket);
  require('../api/settings/settings.socket').register(socket);
  require('../api/share/share.socket').register(socket);
  require('../api/coupon/coupon.socket').register(socket);
  require('../api/exam/exam.socket').register(socket);
  require('../api/communityLeaders/communityLeaders.socket').register(socket);
  require('../api/omnipoint/omnipoint.socket').register(socket);
  require('../api/blockuser/blockuser.socket').register(socket);
  require('../api/chatrooms/chatrooms.socket').register(socket);
  require('../api/chatarchive/chatarchive.socket').register(socket);
  require('../api/chatmessage/chatmessage.socket').register(socket);
  require('../api/betaKey/betaKey.socket').register(socket);
  require('../api/email/email.socket').register(socket);
  require('../api/token/token.socket').register(socket);
  require('../api/user/user.socket').register(socket);
}

module.exports = function (socketio) {
  // socket.io (v1.x.x) is powered by debug.
  // In order to see all the debug output, set DEBUG (in server/config/local.env.js) to including the desired scope.
  //
  // ex: DEBUG: "http*,socket.io:socket"

  // We can authenticate socket.io users and access their token through socket.handshake.decoded_token
  //
  // 1. You will need to send the token in `client/components/socket/socket.service.js`
  //
  // 2. Require authentication here:
  // socketio.use(require('socketio-jwt').authorize({
  //   secret: config.secrets.session,
  //   handshake: true
  // }));

  socketio.on('connection', function (socket) {
    socket.address = socket.handshake.address !== null ?
            socket.handshake.address.address + ':' + socket.handshake.address.port :
            process.env.DOMAIN;

    socket.connectedAt = new Date();

    // Call onDisconnect.
    socket.on('disconnect', function () {
      onDisconnect(socket);
      console.info('[%s] DISCONNECTED', socket.address);
    });

    // Call onConnect.
    onConnect(socket);
    console.info('[%s] CONNECTED', socket.address);
  });
};
