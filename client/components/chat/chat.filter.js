'use strict';

angular.module('fsaApp')
  .filter('chat', function (roomName) {
    return function (allChatMessages) {
      var filteredChatMessages = [];
      for (var message = 0; message < allChatMessages.length; message++) {
        console.log(allChatMessages[i])
      }
      // return 'chat filter: ' + input;
    };
  });
