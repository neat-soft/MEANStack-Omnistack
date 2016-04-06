'use strict';

angular.module('fsaApp')
  .controller('SignupModalCtrl', function ($scope, Auth, $location, $window, $http, $routeParams,  $cookieStore, $cookies) {
    Auth.logout();
    $scope.user = {};
    $scope.errors = {};
    $scope.setEmail = false;
    $scope.signupError = $cookies.signupError;

    if ($scope.ngDialogData) {
      if ($scope.ngDialogData.message) {
        $scope.message = $scope.ngDialogData.message;
      }

      if ($scope.ngDialogData.name) {
        $scope.user.name = $scope.ngDialogData.name;
      }

      if ($scope.ngDialogData.period) {
        $scope.user.period = $scope.ngDialogData.period;
      }
    }
    
    if ($scope.signupError) {
      $cookieStore.remove('signupError');
    }

    $scope.register = function(form) {
      $scope.submitted = true;

      if(form.$valid) {
        var userData = $scope.user;
        Auth.createUser(userData)
        .then( function(user) {
          // Account created, redirect to Account
          $scope.closeThisDialog(user);
        })
        .catch( function(err) {
          err = err.data;
          $scope.errors = {};

          // Update validity of form fields that match the mongoose errors
          angular.forEach(err.errors, function(error, field) {
            form[field].$setValidity('mongoose', false);
            $scope.errors[field] = error.message;
          });
        });
      }
    };
  });
