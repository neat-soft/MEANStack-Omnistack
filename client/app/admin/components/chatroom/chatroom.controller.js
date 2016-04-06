'use strict';

angular.module('fsaApp')
  .controller('ChatroomCtrl', function ($scope, socket, Auth, $http, ngDialog) {
    // Predefined Rooms Types
    $scope.roomTypes = [{name: 'Free', value: 'free'}, {name: 'Premium', value: 'premium'}];

    // Fetch All Rooms
    $http.get('/api/chatrooms').success(function (rooms) {
      $scope.rooms = rooms;
      socket.syncUpdates('chatrooms', $scope.rooms);
    });

    // Add ChatRoom Modal
    $scope.addChatRoomModal = function () {
      ngDialog.open({
        template: 'components/addChatRoom/addChatRoom.html',
        controller: 'AddChatRoomCtrl',
        scope: $scope
      });
    };

    // Delete ChatRoom
    $scope.deleteRoom = function (room) {
      $http.delete('/api/chatrooms/' + room._id);
    };

    $scope.$on('$destroy', function () {
      socket.unsyncUpdates('chatrooms');
    });
  });
