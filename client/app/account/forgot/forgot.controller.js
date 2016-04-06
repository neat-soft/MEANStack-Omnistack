'use strict';

angular.module('fsaApp')
  .controller('ForgotCtrl', function ($scope, $http, Auth) {
    $scope.forgot = function(form) {
      if(form.$valid) {
        Auth.forgot($scope.user.email)
          .then( function(data) {
            $scope.alertType = 'success';
            $scope.alertMsg = 'Email sent successfully';
          })
          .catch( function(err) {
            $scope.alertType = 'danger';
            $scope.alertMsg = err.message;
          });

        $scope.user.email = '';
      }
    };
  });
