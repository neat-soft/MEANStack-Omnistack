'use strict';

angular.module('fsaApp')
  .controller('SettingsCtrl', function ($http, $window, $scope, User, Auth) {
    var oldName = '';
    User.get(function(response) {
      $scope.user = {
        name: response.name,
        email: response.email,
        provider: response.provider
      };
      oldName = response.name;
      $scope.canChangeName = !response.nameChanged;
    });
    $scope.errors = {};
    $scope.secret = false;
    $scope.changeAccountInfo = function(form) {
      $scope.infoSubmitted = true;
      if (form.$valid) {
        Auth.changeInfo(form)
        .then( function() {
          $scope.infoMessage = 'Account information successfully updated.';
          $scope.$root.userName = $scope.user.name;
          if ($scope.user.name !== oldName) {
            $scope.canChangeName = false;
          }
        })
        .catch( function(response) {
          if (response.status === 304) {
            //Nothing changed
            $scope.infoMessage = 'Nothing updated. Information is the same.';
          }
          else {
            //Validation Error
            form.email.$setValidity('mongoose', false);
            $scope.errors.email = 'E-Mail already in use.';
            $scope.infoMessage = '';
          }
        });
      }
    };
    $scope.changePassword = function(form) {
      $scope.passSubmitted = true;
      if(form.$valid) {
        Auth.changePassword( $scope.user.oldPassword, $scope.user.newPassword )
        .then( function() {
          $scope.passMessage = 'Password successfully changed.';
        })
        .catch( function() {
          form.password.$setValidity('mongoose', false);
          $scope.errors.oldPassword = 'Incorrect password';
          $scope.passMessage = '';
        });
      }
    };
  });
