'use strict';

angular.module('fsaApp')
  .controller('ResetCtrl', function ($scope, $routeParams, Auth) {

    $scope.resetPassword = function(form) {
      $scope.submitted = true;
      if(form.$valid) {
        Auth.resetPassword($routeParams.token, $scope.user.newPassword )
          .then( function() {
            $scope.alertType = 'success';
            $scope.alertMsg = 'Password set successfully';
          })
          .catch( function(err) {
            $scope.alertType = 'danger';
            $scope.alertMsg = err.message;
          });
        $scope.user.newPassword = '';
        $scope.form.$setPristine();
      }
    };
  });
