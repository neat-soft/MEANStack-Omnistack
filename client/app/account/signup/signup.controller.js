'use strict';

angular.module('fsaApp')
  .controller('SignupCtrl', function ($scope, Auth, $location, $window, $http, $routeParams,  $cookieStore, $cookies) {
    Auth.logout();
    $scope.user = {};
    $scope.errors = {};
    $scope.setEmail = false;
    $scope.signupError = $cookies.signupError;
    if ($scope.signupError) {
      $cookieStore.remove('signupError');
    }
    var key = $routeParams.key;
    if ($routeParams.name) {
      $scope.user.name = $routeParams.name;
    }
    if($routeParams.email) {
      $scope.user.email = $routeParams.email;
    }
    if (key) {
      Auth.validateBetaKey(key, function(err) {
        if (err) {
          $cookies.signupError = 'Invalid Key';
          $location.path('/signup');
        }
      });

      Auth.getBetaKey(key, function(response) {
        if (response === 'Error') {
          $cookies.signupError = 'Key error';
          $location.path('/');
        }
        else {
          var betaKey = response[0];
          if (!betaKey.massKey) {
            //Set form fields from unique Beta Key
            $scope.user.email = betaKey.email;
            $scope.setEmail = true;
            $scope.user.role = betaKey.role;
          }
          if (betaKey.academicRole !== 'Any') {
            $scope.setAcademicRole = true;
            $scope.user.academicRole = betaKey.academicRole;
          }
        }
      });
    }
    $scope.register = function(form) {
      $scope.submitted = true;

      if(form.$valid) {
        var userData = $scope.user;
        if (key) {
          userData.key = key;
          Auth.createUserFromKey(userData)
          .then( function() {
            // Account created, redirect to Account **/
            $location.path('/account');
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
        else {
          Auth.createUser(userData)
          .then( function() {
            // Account created, redirect to Account
            $location.path('/');
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
      }
    };

    $scope.loginOauth = function(provider) {
      if (key) {
        $window.location.href = '/auth/' + provider + '/key/' + key;
      } else {
        $window.location.href = '/auth/' + provider;
      }
    };
  });
