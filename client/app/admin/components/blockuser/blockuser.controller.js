'use strict';

angular.module('fsaApp')
  .controller('BlockuserCtrl', function ($scope, $http, socket) {
    $scope.blockedUsers = [];
    $scope.radioModel = '';

    //Get Blocked Users
    $http.get('/api/blockusers').success(function (users) {
      $scope.blockedUsers = users;
    });

    //Listen for updates
    socket.syncUpdates('blockuser', $scope.blockedUsers, function (action, a) {
      if (action == 'deleted') {
        for (var i = 0; i < $scope.blockedUsers.length; ++i) {
          if ($scope.blockedUsers[i]['_id'] == a._id) {
            $scope.blockedUsers.splice(i, 1);
          }
        }
      } else if (action == 'created') {
        for (var j = 0; j < $scope.blockedUsers.length; ++j) {
          if ($scope.blockedUsers[j]['_id'] == a._id) {
            $scope.blockedUsers.splice(j, 1);
          }
        }
        $scope.blockedUsers.push(a);
      }
    });

    //Lift Ban
    $scope.activate = function (user) {
      $http.delete('/api/blockusers/' + user._id);
    };

    //Update users block type to temporary
    $scope.temporary = function (user) {
      var temporary = user;
      temporary.type = 1;
      $http.put('/api/blockusers/' + temporary._id, temporary);
    };

    //Update users block type to permanent
    $scope.permanent = function (user) {
      var permanent = user;
      permanent.type = 2;
      $http.put('/api/blockusers/' + permanent._id, permanent);
    };

  });
