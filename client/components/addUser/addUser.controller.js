'use strict';

angular.module('fsaApp')
  .controller('AddUserCtrl', function ($scope, $http, User, ngDialog) {
    $scope.addNewUser = function(email) {
      $http.post(
        'api/users/customer',
        {email: email}
      )
      .error(function(err) {
        alert(JSON.stringify(err));
      });
    };
  });
