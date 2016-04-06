'use strict';

angular.module('fsaApp')
  .controller('AddChatRoomCtrl', function ($scope, $http, Auth, ngDialog) {
    $scope.currentUser = Auth.getCurrentUser();
    var userEmail = $scope.currentUser['email'];

    $scope.addNewRoom = function (roomName, roomType) {
      $scope.hasNameError = false;
      $scope.hasRoomTypeError = false;

      if (typeof roomName === 'undefined') {
        $scope.hasNameError = true;
        return false;
      }
      if (typeof roomType === 'undefined') {
        $scope.hasRoomTypeError = true;
        return false;
      }

      $http.post(
        'api/chatrooms',
        {name: roomName, createdBy: userEmail, roomType: roomType, timestamp: Date.now()}
      ).error(function (err) {
          alert(JSON.stringify(err));
        });
    };
  });
