'use strict';

angular.module('fsaApp')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/beta', {
        templateUrl: 'app/account/signup/beta/beta.html',
        controller: 'BetaCtrl'
      });
  });
