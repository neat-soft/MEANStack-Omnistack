'use strict';

angular.module('fsaApp')
  .controller('BetaSignupCtrl', function ($window, $scope, $location, Auth, $cookieStore, $cookies) {
    Auth.logout();
    $scope.role = {};
    $scope.chkSubmitted = false;
    $scope.signupError = $cookies.signupError;
    if ($scope.signupError) {
      $cookieStore.remove('signupError');
    }
    /* Removed function as beta keys can no longer be requested.
    $scope.reqSubmitted = false;
    $scope.request = {};
    $scope.requestBeta = function(form) {
      $scope.reqSubmitted = true;
      if(form.$valid) {
        var request = {
          email: $scope.request.email,
          role: $scope.request.role
        };

        if (request.role === 'Other') {
          request.role = $scope.role.other;
        }

        Auth.requestBeta(request, function(err) {
          if (err) {
            $scope.errors = {};
            // Update validity of form fields that match the mongoose errors
            angular.forEach(err.errors, function(error, field) {
              form[field].$setValidity('mongoose', false);
              $scope.errors[field] = error.message;
            });
          }
          $scope.reqSuccess = true;
        });
      }
    };
    */
    $scope.checkKey= function() {
      $scope.chkSubmitted = true;
      $scope.errors = {};
      if ($scope.betaKey) {
        var key = $scope.betaKey;
        console.log(key);
        Auth.validateBetaKey(key, function(err) {
          if (err) {
            $scope.errors.betaKey = err;
            console.log($scope.errors.betaKey);
          }
          else {
            console.log('redirecting');
            var redirectUrl = '/signup/key/' + key;
            $location.path(redirectUrl);
          }
        });
      }
      else {
        $scope.errors.betaKey = 'required';
        console.log('error set');
      }
    };
  });
